---
title: "Laravel Package Developments"
subtitle: "Laravel Package Developments"
date: "2024-12-14"
---

# Laravel Package Developments

We are going to build a simple Laravel package called
<i class="text-secondary-light">everest </i>.
We need a way to test and run our package. Since we can't run the artisan command within the package, we will use a Laravel 10 application as a
<i class="text-secondary-light">test-bench</i> for our
<i class="text-secondary-light">everest</i> package.

Here I'll be using Laravel 10 with PHP 8.1.
We will symlink our package into the Laravel application, so keeping both the package and the application within the same directory will be easy for us.

### Setting up the environment

Make a directory called <i class="text-secondary-light">LaravelPackageDevelopment</i> in your preferred path using

```
mkdir LaravelPackageDevelopment
cd LaravelPackageDevelopment
```

#### Create the test bench

Then first we were going to create our <i class="text-secondary-light">test-bench</i> by running the below command in the above-created directory.

```php
composer create-project laravel/laravel:^10.0 test-bench
```

Now we have to create our package

#### create the everest package

Create a directory called <i class="text-secondary-light">everest </i> in the above
<i class="text-secondary-light">LaravelPackageDevelopment </i> directory and navigate into it. Then create a few new directories as listed below as our package directory structure.

```
mkdir everest
cd everest
mkdir app
mkdir src
mkdir resources
mkdir routes
```

Then create a composer.json file and provide essential details like name, type, etc.

```php
composer init
```

<i class="text-secondary-light">[Service providers](https://laravel.com/docs/10.x/providers)</i>
<br>
<i class="text-secondary-light">[Service container](https://laravel.com/docs/10.x/container)</i>
Service providers are the connection point between your package and Laravel. A service provider is responsible for binding things into Laravel's service container and informing Laravel where to load package resources such as views, configuration, and language files.

Let's create our main service provider of the <i class="text-secondary-light">everest </i>.

```
cd src
mkdir ServiceProviders
cd ServiceProviders
touch EverestServiceProvider.php
```

in order to get <i class="text-secondary-light">illuminate/support </i> features, we will install that package (the package version should be compatible with the
<i class="text-secondary-light">test-bench</i> Laravel version).
We will install livewire as well for later usage.

composer.json should look like this

```php
{
	"name": "dissanayake/everest",
	"type": "library",
	"autoload": {
		"psr-4": {
			"Dissanayake\\Everest\\": "src/",
        	"Dissanayake\\Everest\\App\\": "app/"
		}
	},
	"require": {
		 "illuminate/support": "^10.0" //this should be compatible with application version
         "livewire/livewire": "^3.5" //this should be compatible with application version
	},
	"extra": {
		"laravel": {
			"providers": [
				"Dissanayake\\Everest\\ServiceProviders\\EverestServiceProvider"
			]
		}
	}
}
```

```
cd everest
composer update
```

Note: We autoloaded our src and app directories in order to recognize them by Laravel and registered our main service provider of the package.

Now, let's try to create a simple view file in the package and use it in the
<i class="text-secondary-light">test-bench</i>.
For that we first need to configure <i class="text-secondary-light">test-bench</i> to use our <i class="text-secondary-light">everest </i> package as a dependency.

Update <i class="text-secondary-light">test-bench</i> composer.json as below.

```php
"require": {
        "php": "^8.1",
        "dissanayake/everest": "dev-main", //if you have no tagged the package, this is the way to use it
        "livewire/livewire": "^3.5" //install livewire for later usage
    },
"minimum-stability": "dev",
"prefer-stable": true,

"repositories": [
    {
        "type": "path",
        "url": "../everest/"
    }
]
```

```
cd test-bench
composer update
```

Now everything is set up.
We have to load our views of the packages in order to recognize them by
<i class="text-secondary-light">test-bench</i>.
update <i class="text-secondary-light">EverestServiceProvider</i>

```php
public function boot(): void
{
    $rootPathFromThisLocation = __DIR__ . '/../..';

    // Register the package views under the namespace 'everest'
    $this->loadViewsFrom($rootPathFromThisLocation . '/resources/views', 'everest');

    //Overriding Package Views from the application
    //Laravel will first check if a custom version of the view has been placed in the resources/views/vendor/everest 				//directory by the developer.
    //Then, if the view has not been customized, Laravel will search the package view directory you specified in your call          //to loadViewsFrom
}
```

Create a view in the <i class="text-secondary-light">everest </i>
<i class="text-secondary-light">everest/resources/views/welcome.blade.php</i>

```html
<h1>Blade view from everest package!</h1>
```

Now, lets use this in our <i class="text-secondary-light">test-bench</i>

```php
web.php
Route::get('/package', function () {
    return view('everest::welcome');
});
```

now we can run, laravel server up command from
<i class="text-secondary-light">test-bench</i> and see the view in the broser

```
php artisan serve
```

So, that is basically it.
we can even publish our package views,configs,components, livewires by updating the boot method like below

```php
 $this->publishes([
            $rootPathFromThisLocation . '/config/everest_config.php' => config_path('everest_config.php'),
        ], 'everest-config');
```

```
php artisan vendor:publish --tag=everest-config
```

#### Setting up package routes

create a route in the package everest/routes/web_routes.php

```php
//everest/routes/web_routes.php
<?php

use Illuminate\Support\Facades\Route;

Route::get('/everest-default-web-route', function () {
    return 'everest-default-web-route';
});
```

load routes from service provider

```php
$this->loadRoutesFrom($rootPathFromThisLocation . '/routes/web_routes.php');
```

#### Setting up blade components

<i class="text-secondary-light">create everest/app/View/Components/AlertComponent.php</i>

```php
//everest/app/View/Components/AlertComponent.php
<?php

namespace Dissanayake\Everest\App\View\Components; //we autoloaded our package app directory from the composer.json
//namespace App\View\Components; // we can use default namespace as well, but is not a good practice as the better way is to keep package things under package's namespace

use Illuminate\View\Component;

class AlertComponent extends Component
{
    public function __construct() {}

    public function render()
    {
        return view('everest::alert'); //we already have registered out views under everest name
    }
}

```

then create the blade <i class="text-secondary-light">everest/resources/views/alert.blade.php</i>

```html
<h1>I'm the alert blade from everest</h1>
```

now update the service provider

```php
Blade::component('everest-alert', AlertComponent::class);
// Blade::component('package-alert', \App\View\Components\AlertComponent::class); //use this if you used default namespace for the blade component
```

update <i class="text-secondary-light">test-bench</i> web.php

```php
Route::get('/', function () {
   return view('welcome');
});
```

and update <i class="text-secondary-light">resources/views/welcome.blade.php</i>

```html
<!DOCTYPE html>
<html>
	<body>
		<x-everest-alert />
	</body>
</html>
```

run the server and you can see this component has been rendered successfully.

as the last thing lets setup livewire as well

#### Setting up livewire

Livewire component has two files, the class and the blade view

create a livewire class called ExampleComponent in
<i class="text-secondary-light">app/Http/Livewire/</i>

```php
<?php

namespace Dissanayake\Everest\App\Http\Livewire;

use Livewire\Component;

class ExampleComponent extends Component
{
    public $message = 'Hello from package lvewire!';

    public function render()
    {
        return view('everest::livewire.example-component');
    }
}

```

and create the livewire blade
<i class="text-secondary-light">resources/views/livewire/example-component.blade.php</i>

```html
<div>
	<h1>{{ $message }}</h1>
</div>
```

then lets update our package service provider boot method once again

```php
Livewire::component('example-component', ExampleComponent::class);
```

now we want to check if this is working in the
<i class="text-secondary-light">test-bench</i>
<i class="text-secondary-light">update resources/views/welcome.blade.php</i>

```html
<!DOCTYPE html>
<html>
	<body>
		<x-everest-alert />
		<livewire:example-component />
	</body>
</html>
```

And hooray!, you can see it is working fine.

Here i only covered view, blade,livewire and routes. For greater details please check the official documentation of the laravel [here](https://laravel.com/docs/11.x/packages)

Bonus:

You may have more than one livewire/blade component. Loading them one by one in the service provider is not a good approach.
so move it to a separate function.

```php
// Livewire::component('example-component', ExampleComponent::class);
// Automatically register Livewire components
$this->registerLivewireComponents();

protected function registerLivewireComponents()
    {
        $namespace = 'Dissanayake\\Everest\\App\\Http\\Livewire';
        $livewirePath = __DIR__ . '/../../app/Http/Livewire';

        if (File::isDirectory($livewirePath)) {
            foreach (File::allFiles($livewirePath) as $file) {
                $className = $namespace . '\\' . str_replace(
                    ['/', '.php'],
                    ['\\', ''],
                    $file->getRelativePathname()
                );

                if (class_exists($className)) {
                    //i use everest alias here, but it is up to you
                    $alias = 'everest::' . strtolower(preg_replace(
                        '/([a-z])([A-Z])/',
                        '$1-$2',
                        str_replace('\\', '-', str_replace($namespace . '\\', '', $className))
                    ));

                    Livewire::component($alias, $className);
                }
            }
        }
    }
```

now use them in the <i class="text-secondary-light">test-bench</i> like below

```html
<livewire:example-component />
//if an alias added
<livewire:everest::example-component />
```

Thank you!