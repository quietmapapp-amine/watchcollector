++ Lancer le build automatiquement ++

cd /Users/amine/Projects/WatchCollector
gem install bundler
bundle install
bash scripts/pods_doctor.sh
make release


++ Lancer le build a la main ++

cd /Users/amine/Projects/WatchCollector
open ios/WatchCollector.xcworkspace