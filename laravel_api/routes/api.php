<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// routes/api.php
Route::get('/ping', function () {
    return response()->json(['message' => 'pong']);
});
Route::post('/translate', [\App\Http\Controllers\Translator::class, 'translate']);
Route::get('/status/{job_id}', [\App\Http\Controllers\Translator::class, 'get_status']);
Route::get('/download/{job_id}', [\App\Http\Controllers\Translator::class, 'download']);
