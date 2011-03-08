require 'rubygems'
require 'bundler/setup'
require 'closure-compiler'
require 'jslint'
require 'webrick'

build_dir = 'build'
prefix = File.dirname(__FILE__)
build_prefix = File.join(prefix, build_dir)

version = File.join(prefix, 'VERSION')
lectric = File.join(build_prefix, 'lectric.js')
lectric_min = File.join(build_prefix, 'lectric.min.js')

files = ['intro.js', 
         'position.js', 
         'base_slider.js', 
         'touch_slider.js',
         'outro.js']
files = files.map {|f| File.join(prefix, 'js', f) }

task :default => :build

desc "Build and minify Lectric."
task :build => [:combine, :lint, :minify] do
  puts "Lectric build complete."
end

task :combine do
  output = ''
  files.each do |f|
    fc = File.read f
    fc.gsub!(/.function.Lectric..{/, '')
    fc.gsub!(/}..Lectric.;/, '')
    output += fc
  end

  FileUtils.mkdir build_prefix unless Dir.exists?(build_prefix)

  file = File.open(lectric, 'w')
  file.puts output
  file.close
end

desc "Run library against JSLint"
task :lint do
  lint = JSLint::Lint.new(
    :paths => ['build/**/*.js'],
    :exclude_paths => ['js/**/*.min.js']
  )
  lint.run
end

desc "Compress the library using Google's Closure Compiler"
task :minify => :version do
  puts "Minifying Lectric..."
  comments = <<-EOS
  /*!
   * Lectric v#{@version}
   * http://github.com/mckinney/lectric
   *
   * Copyright 2011, McKinney
   * Licensed under the MIT license.
   * http://github.com/mckinney/lectric/blob/master/LICENSE
   *
   * Author: Brett C. Buddin
   */
  EOS

  file = File.open(lectric_min, 'w')
  file.puts comments + Closure::Compiler.new.compile(File.open(lectric, 'r'))
  file.close
end

task :version do
  @version = File.read(version).strip
  puts "VERSION: #{@version}"
end

desc "Remove the build directory"
task :clean do
  `rm -rf #{build_prefix}`
end

desc "Starts an HTTP server in the current directory"
task :server do
  config = {:Port => 3000, :DocumentRoot => '.'}
  server = WEBrick::HTTPServer.new config
  ['INT', 'TERM'].each do |signal|
    trap(signal) { server.shutdown }
  end

  server.start
end
