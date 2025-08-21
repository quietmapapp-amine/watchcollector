SHELL := /bin/bash
export PATH := $(HOME)/.rbenv/shims:$(HOME)/.rvm/bin:$(PATH)

help:
	@echo "Targets:"
	@echo "  setup-ios        -> pod install + verify workspace"
	@echo "  version-bump     -> bump CURRENT_PROJECT_VERSION"
	@echo "  build-ipa        -> build Release .ipa"
	@echo "  upload-tf        -> upload .ipa to TestFlight"
	@echo "  release          -> pods + bump + build + upload"

setup-ios:
	cd ios && bundle exec pod install || (echo "Pod install failed"; exit 1)
	@test -e ios/WatchCollector.xcworkspace -o -e ios/WatchCollector.xcodeproj

version-bump:
	bundle exec fastlane ios bump_build

build-ipa:
	bundle exec fastlane ios build

upload-tf:
	bundle exec fastlane ios upload_testflight

release:
	bundle exec fastlane ios release
