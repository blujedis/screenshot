# Screenshot Puppet

Simple util using puppet to capture screenshots as png or pdf. The utility will store files in directory named ".ssp" in the home folder for your operating system.

Time permitted new commands and options will be provided.

## Install

```sh
$ npm install -g
```

## Usage

Screenshot Puppet currently has four basic commands: take, list, view, browse.

### Taking a Screenshot (take)

```sh
$ ssp take 'your-url.com'
```

#### Saving a PDF

```sh
$ ssp take 'your-url.com' --pdf
```

#### Renaming a Screenshot

By default the domain of your url will be used as the file name as it is generally unique. If you wish to name it something else simply provided it. The extension will be either .pdf or .png depending on flags you have chosen.

The below would result in 'your_name.png'.

```sh
$ ssp take 'your-url.com' 'your_name'
```

### Listing Screenshots (list)

Outputs a list of screenshots in your .ssp directory.

```sh
$ ssp list
```

### Browsing Screenshots (browse)

Will open your default finder, explorer etc to browse your screenshots.

```sh
$ ssp list
```

### Viewing Screenshots (view)

Screenshot Puppet will look for like names, hence you could type <code>some_name</code> and the file would still be viewed. If more than one option is found a list is displayed so you can issue a new command.

You can also use glob type patterns to search for files for example you could also search for the below using <code>some_\*.png</code>

```sh
$ ssp view some_name.png
```

### Removing Screenshots (remove)

You can remove files by providing a glob pattern just like when viewing and all matches will be removed. Provide no filter with --all flag and all screenshots will be purged.

```sh
$ ssp remove --all
```

This below would remove all screenshots with .png file extension. 

NOTE: Be sure to wrap patterns in quotes or your terminal may complain to you!

```sh
$ ssp remove '*.png' 
```

## Getting Help 

A help menu is provided issue the following to view:

```sh
$ ssp -h
```



