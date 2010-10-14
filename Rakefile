require 'rubygems'
require 'bundler/setup'
require 'closure-compiler'

prefix = File.dirname(__FILE__)
lectric = File.join(prefix, 'js', 'lectric.js')
lectric_min = File.join(prefix, 'js', 'lectric.min.js')
version = File.join(prefix, 'VERSION')

task :default => :all

desc "Build and minify Lectric."
task :all => [:stamp_version, :minify] do
  puts "Lectric build complete."
end

desc "Stamp the library with the current version"
task :stamp_version => :version do
  contents = File.read(lectric)
  file = File.open(lectric, 'w')
  file.puts contents.gsub(/(Lectric v)([\d\w\.-]+)/, "\\1#{@version}")
  file.close
end

desc "Compress the library using Google's Closure Compiler"
task :minify => :version do
  puts "Minifying Lectric..."
  comments = <<-EOS
  /*!
   * Lectric v#{@version}
   * http://github.com/mckinney/lectric
   *
   * Copyright 2010, McKinney
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
