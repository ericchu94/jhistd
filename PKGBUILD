# Maintainer: Eric Chu <eric@ericchu.net>
pkgname=jhistd-git
pkgver=v1.0.3.r0.f85d423
pkgrel=1
pkgdesc='a jhist server daemon'
arch=('any')
url='https://github.com/ericchu94/jhistd'
license=('GPL')
depends=('nodejs'
         'npm')
provides=("${pkgname%-git}")
conflicts=("${pkgname%-git}")
source=('git://github.com/ericchu94/jhistd.git')
md5sums=('SKIP')
install="${pkgname%-git}.install"

pkgver() {
  cd "$srcdir/${pkgname%-git}"
  printf "%s" "$(git describe --long --tags | sed 's/\([^-]*-\)g/r\1/;s/-/./g')"
}

package() {
  cd "$srcdir/${pkgname%-git}"

  mkdir -p "$pkgdir/opt/${pkgname%-git}"
  cp -r *.js *.json yarn.lock models api "$pkgdir/opt/${pkgname%-git}"

  mkdir -p "$pkgdir/etc/${pkgname%-git}"
  cp jhistd.env "$pkgdir/etc/${pkgname%-git}"

  mkdir -p "$pkgdir/usr/lib/systemd/system"
  cp jhistd.service "$pkgdir/usr/lib/systemd/system"
}
