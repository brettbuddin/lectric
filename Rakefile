require 'rubygems'
require 'bundler/setup'
require 'closure-compiler'

prefix = File.dirname(__FILE__)
lectric = File.join(prefix, 'js', 'lectric.js')
lectric_min = File.join(prefix, 'js', 'lectric.min.js')

task :default => :all

desc "Build and minify Lectric."
task :all => :minify do
  puts "Lectric build complete."
end

desc "Compress the library using Google's Closure Compiler"
task :minify do
  puts "Minifying Lectric..."
  file = File.open(lectric_min, 'w')
  file.puts Closure::Compiler.new.compile(File.open(lectric, 'r'))
  file.close
end
