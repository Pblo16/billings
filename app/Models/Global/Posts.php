<?php

namespace App\Models\Global;

use App\Models\Document;
use App\Models\DocumentRelation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Posts model
 *
 * Relaciones:
 * - user(): Usuario autor del post (belongsTo User)
 * - details(): Detalles de colaborador (hasMany PostDetails)
 */
class Posts extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'text',
        'user_id',
    ];

    /**
     * Usuario autor del post
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    /**
     * Detalles de colaborador (colaboradores asociados a este post)
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function details()
    {
        return $this->hasMany(PostDetails::class, 'post_id');
    }


    /**
     * Posts donde el usuario es colaborador
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function colaboratedPosts()
    {
        return $this->hasMany(\App\Models\Global\PostDetails::class, 'colaborator_id');
    }

    public function documentRelations(): MorphMany
    {
        return $this->morphMany(DocumentRelation::class, 'related');
    }

    public function documents()
    {
        return $this->hasManyThrough(
            Document::class,
            DocumentRelation::class,
            'related_id',
            'id',
            'id',
            'document_id'
        )->where('document_relations.related_type', self::class);
    }
}
