---
title: "기존 시스템에 Laravel 9 커스텀 인증 적용하기"
categories:
  - Programming
toc: true
toc_label: "기존 시스템에 Laravel 9 커스텀 인증 적용하기"
toc_icon: "tags"
toc_sticky: true
---
# Model
User 모델에 기존 시스템에서 사용하는 사용자 테이블을 적용합니다.
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    
    protected $table = '사용자_테이블';
    protected $primaryKey = '사용자_테이블_PK';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $fillable = [
        'user_id',
        'user_password',
    ];
    public function getAuthPassword()
    {
        return $this->user_password;
    }
}
```
# Provider
`app/Providers/AuthServiceProvider.php`의 `boot()` 메소드에 새로 만들 Provider를 적용 해줍니다. `CustomUserProvider`, `CustomHasher` 없는 클래스이기 때문에 이후 단계에서 생성할 것 입니다.
```php
<?php

namespace App\Providers;

use App\Services\CustomHasher;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        // 커스텀 Provider 추가: START
        Auth::provider('custom_provider_driver', function ($app, array $config) {
            return new CustomUserProvider(new CustomHasher(), $config['model']);
        });
        // 커스텀 Provider 추가: END
    }
}
```
`config/auth.php`에 defaults guard는 `web`이고 web의 driver는 session, provider는 `users`로 되어 있습니다. users의 driver는 `eloquent`, model은 `User` 모델입니다. 여기에 커스텀 guards와 커스텀 provider를 추가합니다. 
```php
<?php

return [
    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        // 커스텀 guard 추가: START
        'custom' => [
            'driver' => 'session',
            'provider' => 'custom_provider',
        ],
        // 커스텀 guard 추가: END
    ],
    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
        // 커스텀 provider 추가: START
        'custom_provider' => [
            'driver' => 'custom_provider_driver',
            'model' => App\Models\User::class,
        ],
        // 커스텀 provider 추가: END
    ],
    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],
    'password_timeout' => 10800,
];
```
아래 명령어를 실행하여 커스텀 provider를 생성합니다.
```bash
php artisan make:provider CustomUserProvider
```
`app/Providers/CustomUserProvider.php`가 생성됩니다. 기본적으로 사용되는 `EloquentUserProvider`를 상속받도록 해주고 `validateCredentials()` 메소드를 오버라이드 합니다.
```php
<?php

namespace App\Providers;

use App\Services\CustomHasher;
use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable as UserContract;

class CustomUserProvider extends EloquentUserProvider
{
		// 추가한 부분: START
    public function __construct(CustomHasher $hasher, $model)
    {
        $this->model = $model;
        $this->hasher = $hasher;
    }
    /**
     * Validate a user against the given credentials.
     *
     * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
     * @param  array  $credentials
     * @return bool
     */
    public function validateCredentials(UserContract $user, array $credentials): bool
    {
        if (is_null($plain = $credentials['user_password'])) {
            return false;
        }

        return $this->hasher->check($plain, $user->getAuthPassword(), ['salt' => $user->salt]);
    }
    // 추가한 부분: END

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
```
`app/Services`디렉토리를 생성하고, 디렉토리 내부에 `CustomHasher` 클래스를 생성합니다. `check()` 메서드의 로직을 기존 시스템과 동일하게 작성합니다.
```php
<?php

namespace App\Services;

use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Hashing\AbstractHasher;

class CustomHasher extends AbstractHasher implements Hasher
{
    public function make($value, array $options = [])
    {
        $salt = substr(uniqid(rand()), -6);

        return md5(md5($value) . $salt);
    }

    public function check($value, $hashedValue, array $options = [])
    {
        return md5($value) . $options['salt'] ?? '' === $hashedValue;
    }

    public function needsRehash($hashedValue, array $options = [])
    {
        // Your needsRehash implementation here
    }
}
```

# Authenticate
`app/Http/Middleware/CustomAuthenticate.php`를 생성하고, `app/Http/Kernel.php`에 적용합니다.
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class CustomAuthenticate
{
    public function handle($request, Closure $next)
    {
        if (Auth::guard('custom')->check()) {
            return $next($request);
        } else {
            return redirect()->route('login');
        }
    }
}
```
```php
<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    //중략...

    /**
     * The application's route middleware.
     *
     * These middleware may be assigned to groups or used individually.
     *
     * @var array<string, class-string|string>
     */
    protected $routeMiddleware = [
		    // 미들웨어 추가: START
        'custom.auth' => \App\Http\Middleware\CustomAuthenticate::class,
        // 미들웨어 추가: END
        //중략...
    ];
}
```

# Login
로그인시 `attempt()` 메서드에 `guard`를 명시합니다.
```php
public function authenticate(): void
{
		// 중략...
    
    if (! Auth::guard('custom')->attempt($this->only('user_id', 'user_password'), $this->boolean('remember'))) {
		    // 중략...
    }

		// 중략...
}
```

# Middleware 적용
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('custom.auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return view('home');
    }
}
```