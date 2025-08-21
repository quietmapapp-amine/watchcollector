# frozen_string_literal: true
require "json"

root = File.expand_path(File.dirname(__FILE__) + "/..")
env_path = File.join(root, ".env")
abort("🔴 .env not found at #{env_path}") unless File.exist?(env_path)

# Load .env
env = {}
File.read(env_path).each_line do |l|
  next if l.strip.start_with?("#") || l.strip.empty?
  k,v = l.strip.split("=",2)
  env[k] = v
end

def non_empty_file?(p)
  File.exist?(p) && File.size(p).to_i > 0
end

# 1) Check API key file
key_rel = env["ASC_KEY_FILE"] || ".private/appstoreconnect_api_key.p8"
key_abs = File.expand_path(File.join(root, key_rel))
unless non_empty_file?(key_abs)
  abort("🔴 Missing or empty App Store Connect API key at #{key_abs}.\n➡️ Place your .p8 file there (download from App Store Connect).")
end

# 2) Detect workspace/project
ios_dir = File.join(root, "ios")
workspaces = Dir[File.join(ios_dir, "*.xcworkspace")]
projects   = Dir[File.join(ios_dir, "*.xcodeproj")]
workspace  = workspaces.first
project    = projects.first

abort("🔴 No ios/*.xcworkspace or ios/*.xcodeproj found.") unless workspace || project

# Sync .env paths if needed
env_changed = false
if workspace && (env["XCWORKSPACE_PATH"] != "ios/#{File.basename(workspace)}")
  env["XCWORKSPACE_PATH"] = "ios/#{File.basename(workspace)}"; env_changed = true
end
if project && (env["XCODEPROJ_PATH"] != "ios/#{File.basename(project)}")
  env["XCODEPROJ_PATH"] = "ios/#{File.basename(project)}"; env_changed = true
end

# 3) Detect schemes
def xcode_list_json(workspace, project, ios_dir)
  cmd = if workspace
    %(xcodebuild -list -json -workspace "#{workspace}")
  else
    %(xcodebuild -list -json -project "#{project}")
  end
  out = `cd "#{ios_dir}" && #{cmd} 2>/dev/null`
  out.empty? ? nil : JSON.parse(out) rescue nil
end

list = xcode_list_json(workspace && File.basename(workspace), project && File.basename(project), ios_dir)
schemes = (list && list["schemes"]) || []

# Fallback: if xcodebuild failed, try to read shared xcschemes filenames
if schemes.empty?
  puts "⚠️  xcodebuild failed, trying fallback scheme detection..."
  if project
    shared_schemes = Dir[File.join(project, "xcshareddata/xcschemes/*.xcscheme")]
    schemes = shared_schemes.map { |s| File.basename(s, ".xcscheme") }
  end
  if schemes.empty? && workspace
    shared_schemes = Dir[File.join(workspace, "xcshareddata/xcschemes/*.xcscheme")]
    schemes = shared_schemes.map { |s| File.basename(s, ".xcscheme") }
  end
end

abort("🔴 Could not enumerate schemes via xcodebuild or fallback detection.") if schemes.empty?

# Prefer a scheme matching env["SCHEME"] (case-insensitive), otherwise pick a non-Pods first.
env_scheme = (env["SCHEME"] || "").strip
detected = schemes.find { |s| s.downcase == env_scheme.downcase } ||
           schemes.find { |s| !s.downcase.include?("pods") } ||
           schemes.first

if env_scheme != detected
  env["SCHEME"] = detected
  env_changed = true
end

# 4) Warn if bundle id mismatch
pbxproj = project ? File.join(project, "project.pbxproj") : nil
bundle_warn = nil
if pbxproj && File.exist?(pbxproj) && env["APP_IDENTIFIER"]
  text = File.read(pbxproj)
  unless text.include?(env["APP_IDENTIFIER"])
    bundle_warn = "⚠️ PRODUCT_BUNDLE_IDENTIFIER may not match #{env["APP_IDENTIFIER"]}. Check Signing in Xcode."
  end
end

# 5) Ensure ITSAppUsesNonExemptEncryption=NO in Info.plist of main target (best-effort)
info_plists = Dir[File.join(ios_dir, "**/Info.plist")]
info_plists.each do |p|
  next unless File.file?(p)
  content = File.read(p)
  next if content.include?("ITSAppUsesNonExemptEncryption")
  content.sub!(/<\/dict>\s*<\/plist>/m, "  <key>ITSAppUsesNonExemptEncryption</key>\n  <false/>\n</dict>\n</plist>")
  File.write(p, content)
end

# Write back .env if changed
if env_changed
  lines = File.read(env_path).lines
  keys = env.keys
  # rewrite keys we touched while preserving other lines and comments
  new_lines = lines.map do |l|
    if l.strip =~ /^(SCHEME|XCWORKSPACE_PATH|XCODEPROJ_PATH)=/
      k = l.split("=").first
      "#{k}=#{env[k]}\n"
    else
      l
    end
  end
  # ensure presence of keys
  ["SCHEME","XCWORKSPACE_PATH","XCODEPROJ_PATH"].each do |k|
    unless new_lines.any? { |l| l.start_with?("#{k}=") }
      new_lines << "#{k}=#{env[k]}\n"
    end
  end
  File.write(env_path, new_lines.join)
end

puts "✅ Preflight OK"
puts "   Workspace: #{workspace ? File.basename(workspace) : '-'}"
puts "   Project:   #{project ? File.basename(project) : '-'}"
puts "   Scheme:    #{env["SCHEME"]}"
puts "   Key file:  #{key_rel} (#{File.size(key_abs)} bytes)"
puts bundle_warn if bundle_warn
