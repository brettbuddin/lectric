require 'rubygems'
require 'bundler/setup'
require 'closure-compiler'
require 'jslint'
require 'webrick'

prefix = File.dirname(__FILE__)
frankenslide = File.join(prefix, 'js', 'frankenslide.js')
frankenslide_min = File.join(prefix, 'js', 'frankenslide.min.js')
version = File.join(prefix, 'VERSION')

task :default => :build

desc "Build and minify frankenslide."
task :build => [:lint, :stamp_version, :minify] do
  puts "frankenslide build complete."
end

desc "Stamp the library with the current version"
task :stamp_version => :version do
  contents = File.read(frankenslide)
  file = File.open(frankenslide, 'w')
  file.puts contents.gsub(/(frankenslide v)([\d\w\.-]+)/, "\\1#{@version}")
  file.close
end

desc "Run library against JSLint"
task :lint do
  lint = JSLint::Lint.new(
    :paths => ['js/**/*.js'],
    :exclude_paths => ['js/**/*.min.js']
  )
  lint.run
end

desc "Compress the library using Google's Closure Compiler"
task :minify => :version do
  puts "Minifying frankenslide..."
  comments = <<-EOS
  /*!
   * frankenslide v#{@version}
   * http://github.com/mckinney/frankenslide
   *
   * Copyright 2011, McKinney
   * Licensed under the MIT license.
   * http://github.com/mckinney/frankenslide/blob/master/LICENSE
   *
   * Author: Brett C. Buddin
   */
  EOS

  file = File.open(frankenslide_min, 'w')
  file.puts comments + Closure::Compiler.new.compile(File.open(frankenslide, 'r'))
  file.close
end

task :version do
  @version = File.read(version).strip
  puts "VERSION: #{@version}"
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
