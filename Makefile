SHELL := /bin/bash
export PATH := /opt/homebrew/opt/ruby/bin:$(HOME)/.rbenv/shims:$(HOME)/.rvm/bin:$(PATH)

help:
	@echo "Targets:"
	@echo "  setup-ios        -> pod install + verify workspace"
	@echo "  version-bump     -> bump CURRENT_PROJECT_VERSION"
	@echo "  build-ipa        -> build Release .ipa"
	@echo "  upload-tf        -> upload .ipa to TestFlight"
	@echo "  release          -> pods + bump + build + upload"
	@echo "  bootstrap        -> create native iOS project (no Expo)"
	@echo "  purge-expo       -> remove Expo deps (safe backup)"

bootstrap:
	@echo "🚀 Bootstrapping native iOS project..."
	@bash scripts/bootstrap_native_ios.sh

purge-expo:
	@echo "🧹 Purging Expo dependencies..."
	@bash scripts/purge_expo.sh

setup-ios:
	@if [ -f ios/Podfile ]; then \
		echo "📦 Installing pods via fastlane…"; \
		bundle exec fastlane ios pods || (echo "❌ Pod install failed"; exit 1); \
	else \
		echo "ℹ️ No ios/Podfile found — skipping pod install."; \
	fi
	@test -e ios/*.xcworkspace -o -e ios/*.xcodeproj

version-bump:
	@echo "📈 Bumping build version..."
	bundle exec fastlane ios bump_build

build-ipa:
	@echo "🏗️ Building IPA..."
	@test -e ios/*.xcworkspace || (echo "❌ Workspace not found. Run 'make setup-ios' first." && exit 1)
	bundle exec fastlane ios build

upload-tf:
	@echo "🚀 Uploading to TestFlight..."
	@test -f build/WatchCollector.ipa || (echo "❌ IPA not found. Run 'make build-ipa' first." && exit 1)
	bundle exec fastlane ios upload_testflight

release:
	@echo "🎯 Full release pipeline..."
	@make setup-ios
	bundle exec fastlane ios release
	@echo "🎉 Release complete!"
