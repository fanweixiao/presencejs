GO ?= go
GOFMT ?= gofmt "-s"
GOFILES := $(shell find . -name "*.go")
VETPACKAGES ?= $(shell $(GO) list ./... | grep -v /example/)

VER ?= 2.0.3

.PHONY: fmt
fmt:
	$(GOFMT) -w $(GOFILES)

vet:
	$(GO) vet $(VETPACKAGES)

lint:
	revive -exclude epoll.go -formatter friendly ./...

build:

	$(GO) build -o bin/prscd2

dist: clean
	GOOS=linux GOARCH=amd64 $(GO) build -ldflags "-s -w" -o dist/prscd-${VER}-x86_64-linux
	GOOS=linux GOARCH=arm64 $(GO) build -ldflags "-s -w" -o dist/prscd-${VER}-arm64-linux
	GOOS=darwin GOARCH=amd64 $(GO) build -ldflags "-s -w" -o dist/prscd-${VER}-x86_64-darwin
	GOOS=darwin GOARCH=arm64 $(GO) build -ldflags "-s -w" -o dist/prscd-${VER}-arm64-darwin
	GOOS=windows GOARCH=amd64 $(GO) build -ldflags "-s -w" -o dist/prscd-${VER}-x86_64-windows.exe
	GOOS=windows GOARCH=arm64 $(GO) build -ldflags "-s -w" -o dist/prscd-${VER}-arm64-windows.exe

dev:
	DEBUG=true PORT=8443 $(GO) run -race .

test:
	MESH_ID=test go test -v chirp/*

bench:
	MESH_ID=bench LOG_LEVEL=2 go test -bench=. -benchmem yomo.run/prscd2/chirp

testpage:
	@mkdir -p ./test_pages
	@cp msgpack.js ./test_pages
	@cp websocket.html test_pages/.
	@sed -i '' 's/URL_DEBG/URL_PROD/g' test_pages/websocket.html
	@cp webtrans.html test_pages/.
	@sed -i '' 's/URL_DEBG/URL_PROD/g' test_pages/webtrans.html

clean:
	@rm -rf dist
	@rm -rf bin
