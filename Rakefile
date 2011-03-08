require 'rubygems'
require 'bundler/setup'
require 'closure-compiler'
require 'jslint'
require 'webrick'

prefix = File.dirname(__FILE__)
lectric = File.join(prefix, 'js', 'lectric.js')
lectric_min = File.join(prefix, 'js', 'lectric.min.js')
version = File.join(prefix, 'VERSION')

task :default => :build

desc "Build and minify Lectric."
task :build => [:lint, :minify] do
  puts "Lectric build complete."
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

desc "Starts an HTTP server in the current directory"
task :server do
  config = {:Port => 3000, :DocumentRoot => '.'}
  server = WEBrick::HTTPServer.new config
  ['INT', 'TERM'].each do |signal|
    trap(signal) { server.shutdown }
  end

  server.start
end
