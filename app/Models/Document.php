<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    protected $fillable = [
        'name',
        'path',
        'disk',
        'mime_type',
        'size',
        'uploaded_by_id',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_id');
    }

    // CORRECTO: relación hacia DocumentRelation
    public function relations(): HasMany
    {
        return $this->hasMany(DocumentRelation::class, 'document_id');
    }
}
