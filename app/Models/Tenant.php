<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

/**
 * App\Models\Tenant
 * 
 * @property string $id
 * @property string|null $name
 * @property string|null $slug
 * @property string|null $description
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $trial_ends_at
 * @property \Illuminate\Support\Carbon|null $suspended_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property array|null $data
 * 
 * @property-read \Illuminate\Database\Eloquent\Collection|\Stancl\Tenancy\Database\Models\Domain[] $domains
 * @property-read int|null $domains_count
 * @property-read string|null $primary_domain
 * @property-read bool $is_on_trial
 * @property-read bool $is_suspended
 * @property-read bool $trial_expired
 * 
 * @method static \Illuminate\Database\Eloquent\Builder|Tenant newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Tenant newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Tenant query()
 * @method static \Illuminate\Database\Eloquent\Builder|Tenant active()
 * @method static \Illuminate\Database\Eloquent\Builder|Tenant inactive()
 * @method static \Illuminate\Database\Eloquent\Builder|Tenant suspended()
 * @method static \Illuminate\Database\Eloquent\Builder|Tenant onTrial()
 * @method static \Illuminate\Database\Eloquent\Builder|Tenant trialExpired()
 */
class Tenant extends BaseTenant implements TenantWithDatabase
{
  use HasDatabase, HasDomains;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'id',
    'name',
    'slug',
    'description',
    'is_active',
    'trial_ends_at',
    'suspended_at',
    'data'
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'data' => 'array',
    'is_active' => 'boolean',
    'trial_ends_at' => 'datetime',
    'suspended_at' => 'datetime',
  ];

  // Scopes

  /**
   * Scope a query to only include active tenants.
   */
  public function scopeActive(Builder $query): Builder
  {
    return $query->where('is_active', true)->whereNull('suspended_at');
  }

  /**
   * Scope a query to only include inactive tenants.
   */
  public function scopeInactive(Builder $query): Builder
  {
    return $query->where('is_active', false);
  }

  /**
   * Scope a query to only include suspended tenants.
   */
  public function scopeSuspended(Builder $query): Builder
  {
    return $query->whereNotNull('suspended_at');
  }

  /**
   * Scope a query to only include tenants on trial.
   */
  public function scopeOnTrial(Builder $query): Builder
  {
    return $query->whereNotNull('trial_ends_at')
      ->where('trial_ends_at', '>', now());
  }

  /**
   * Scope a query to only include tenants with expired trials.
   */
  public function scopeTrialExpired(Builder $query): Builder
  {
    return $query->whereNotNull('trial_ends_at')
      ->where('trial_ends_at', '<=', now());
  }

  // Accessors

  /**
   * Get the primary domain for the tenant.
   */
  public function getPrimaryDomainAttribute(): ?string
  {
    return $this->domains()->first()?->domain;
  }

  /**
   * Check if tenant is currently on trial.
   */
  public function getIsOnTrialAttribute(): bool
  {
    return $this->trial_ends_at && $this->trial_ends_at->isFuture();
  }

  /**
   * Check if tenant is suspended.
   */
  public function getIsSuspendedAttribute(): bool
  {
    return !is_null($this->suspended_at);
  }

  /**
   * Check if trial has expired.
   */
  public function getTrialExpiredAttribute(): bool
  {
    return $this->trial_ends_at && $this->trial_ends_at->isPast();
  }

  // Methods

  /**
   * Run a callback within the tenant's context.
   * This is a convenience method for running code within the tenant.
   */
  public function run(callable $callback)
  {
    return tenancy()->run($this, $callback);
  }

  /**
   * Check if tenant has a specific domain.
   */
  public function hasDomain(string $domain): bool
  {
    return $this->domains()->where('domain', $domain)->exists();
  }

  /**
   * Get tenant data by key with optional default.
   */
  public function getData(string $key, $default = null)
  {
    return data_get($this->data, $key, $default);
  }

  /**
   * Set tenant data by key.
   */
  public function setData(string $key, $value): self
  {
    $data = $this->data ?? [];
    data_set($data, $key, $value);
    $this->data = $data;

    return $this;
  }

  /**
   * Suspend the tenant.
   */
  public function suspend(?string $reason = null): self
  {
    $this->suspended_at = now();
    $this->is_active = false;

    if ($reason) {
      $this->setData('suspension_reason', $reason);
    }

    $this->save();

    return $this;
  }

  /**
   * Reactivate a suspended tenant.
   */
  public function reactivate(): self
  {
    $this->suspended_at = null;
    $this->is_active = true;

    // Remove suspension reason from data
    $data = $this->data ?? [];
    unset($data['suspension_reason']);
    $this->data = $data;

    $this->save();

    return $this;
  }

  /**
   * Start trial for the tenant.
   */
  public function startTrial(int $days = 14): self
  {
    $this->trial_ends_at = now()->addDays($days);
    $this->save();

    return $this;
  }

  /**
   * End trial for the tenant.
   */
  public function endTrial(): self
  {
    $this->trial_ends_at = null;
    $this->save();

    return $this;
  }
}
