<?php

namespace App\Jobs;

use Gemini\Laravel\Facades\Gemini;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class TranslateSubtitlesJob implements ShouldQueue
{
    use Dispatchable;
    /**
     * Create a new job instance.
     */
    protected $job_id;
    protected $file_name;

    protected $string;
    public function __construct($jobId, $file_name, $string)
    {
        $this->job_id = $jobId;
        $this->file_name = $file_name;
        $this->string = $string;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        /*prompt to generate the subtitles. modify if wanted*/
        $prompt = "Convert the following SRT block to Dutch. Keep the exact same format, same line splits within text blocks, same number of lines per entry, and same timing. Only generate the translated SRT block as output, no introductory text, no explanations, and no ```srt or ``` markers.";

        /*json file*/
        $file_path = storage_path('app/private/translation_jobs/'.$this->job_id.'.json');
        $status_path = storage_path('app/private/translation_jobs/'.$this->job_id.'_status.json');
        $lines = json_decode(file_get_contents($file_path), true);
        $status = json_decode(file_get_contents($status_path), true);

        /*batch size*/
        $batch_size = 75;
        $current = 0;
        $total = count($lines);
        $end_result = "";

        /*looping*/
        while ($current < $total) {
            $to_translate = "";
            $lines_in_batch = 0;

            /*adding to string*/
            while ($lines_in_batch < $batch_size && $current < $total) {
                $line = $lines[$current];
                $to_translate .= $line['index']."\n";
                $to_translate .= $line['start']." --> ".$line['end']."\n";
                $to_translate .= $line['text']."\n\n";
                $current++;
                $lines_in_batch++;
            }

            /*checking if sentence ends correctly.*/
            while (
                $current < $total
                && !preg_match('/[.!?]$/', trim($lines[$current - 1]['text']))
            ) {
                $line = $lines[$current];
                $to_translate .= $line['index']."\n";
                $to_translate .= $line['start']." --> ".$line['end']."\n";
                $to_translate .= $line['text']."\n\n";
                $current++;
                $lines_in_batch++;
            }

            /*generating*/
            $response = Gemini::generativeModel("gemini-1.5-flash")
                ->generateContent($prompt . $to_translate)
                ->text();

            /*saving to end result*/
            $end_result .= $response;
            $status['current'] += $lines_in_batch;
            file_put_contents($status_path, json_encode($status));
        }

        Storage::put('results/'.$this->file_name.'_'.$this->string.'.srt', $end_result);
        $status['status'] = 'completed';
        file_put_contents($status_path, json_encode($status));
    }
}
