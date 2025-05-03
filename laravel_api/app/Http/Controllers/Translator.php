<?php

namespace App\Http\Controllers;
use App\Jobs\TranslateSubtitlesJob;
use Gemini\Laravel\Facades\Gemini;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class Translator extends Controller
{
    //
    public function translate(Request $request)
    {
        $file = $request->file('file');
        $language = $request->input('language');
        if (!$file) {
            return response()->json(['error' => 'No file provided'], 400);
        }
        if (!$language) {
            return response()->json(['error' => 'No language provided'], 400);
        }
        $validation = $this->validate_file($file);
        if ($validation instanceof JsonResponse) {
            return $validation;
        }

        $convert = $this->convert_to_json($file);
        if ($convert instanceof JsonResponse) {
            return $convert;
        }

        $jobId = (string) Str::uuid();
        $code = bin2hex(openssl_random_pseudo_bytes(7));
        $job = [
            'status' => 'pending',
            'amount' => count($convert),
            'current' => 0,
            'job_id' => $jobId,
            'file_name' => $file->getClientOriginalName(),
            'code' => $code,
        ];

        Storage::put('translation_jobs/'.$jobId.'.json', json_encode($convert));
        Storage::put('translation_jobs/'.$jobId.'_status.json', json_encode($job));
        /*dispatch job*/
        TranslateSubtitlesJob::dispatch($jobId, $file->getClientOriginalName(), $code, $language);
        /*job created*/
        return response()->json(['job_id' => $job], 200);
    }
    public function validate_file($file)
    {
        $file_name = $file->getClientOriginalName();
        /*check ending srt*/
        if (substr($file_name, -4) !== '.srt' && substr($file_name, -4) !== '.SRT') {
            return response()->json(['error' => 'File must be a .srt file'], 400);
        }
        /*check file size*/
        if ($file->getSize() > 5000000) {
            return response()->json(['error' => 'File is too large'], 400);
        }
        return true;
    }

    public function convert_to_json($file)
    {
        try{
            $subtitle_file = [];

            /*content inside*/
            $content = file_get_contents($file);

            /*regex pattern for group*/
            $pattern = '/^\s*(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\r?\n(.*?)(?=\r?\n\r?\n|\z)/ms';

            preg_match_all($pattern, $content, $matches, PREG_SET_ORDER);

            $index = 1;
            /*add to obj*/
            foreach ($matches as $match) {
                $subtitle_file[] = [
                    'index' => $index,
                    'start' => $match[1],
                    'end' => $match[2],
                    'text' => (trim($match[3]))
                ];
                $index++;
            }
            /*return resp*/
            return $subtitle_file;
        }
        catch(\Exception $e){
            return response()->json(['error' => 'Error converting file. The SRT file is invalid.'], 400);
        }
    }
    public function get_status($job_id)
    {
        $status_path = storage_path('app/private/translation_jobs/'.$job_id.'_status.json');
        if (!file_exists($status_path)) {
            return response()->json(['error' => 'Job not found'], 404);
        }
        $status = json_decode(file_get_contents($status_path), true);
        return response()->json($status, 200);
    }
    public function download($job_id)
    {
        $status_path = storage_path('app/private/translation_jobs/' . $job_id . '_status.json');
        if (!file_exists($status_path)) {
            return response()->json(['error' => 'Job not found'], 404);
        }
        $status = json_decode(file_get_contents($status_path), true);

        $originalFilename = $status['file_name'];
        $code = $status['code'];
        $downloadFilename = $originalFilename . '_' . $code . '.srt';
        // Path to the SRT file
        $result_path = storage_path('app/private/results/' . $downloadFilename);

        if (!file_exists($result_path)) {
            return response()->json(['error' => 'Result file not found'], 404);
        }

        /*returning download link*/
        return response()->download($result_path, $downloadFilename);
    }

}
