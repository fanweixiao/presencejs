GO ?= go
GOFMT ?= gofmt "-s"
GOFILES := $(shell find . -name "*.go")
VETPACKAGES ?= $(shell $(GO) list ./... | grep -v /example/)

.PHONY: fmt
fmt:
	$(GOFMT) -w $(GOFILES)

vet:
	$(GO) vet $(VETPACKAGES)

lint:
	revive -exclude epoll.go -formatter friendly ./...

build:
	$(GO) build -o bin/prscd2 main.go

dist: clean
	GOOS=linux GOARCH=amd64 $(GO) build -ldflags "-s -w" -o dist/prscd2-linux main.go
	GOOS=linux GOARCH=arm64 $(GO) build -ldflags "-s -w" -o dist/prscd2-linux-arm main.go
	@cp lo.allegrocloud.io.cert.pem dist/.
	@cp lo.allegrocloud.io.key.pem dist/.

dev:
	DEBUG=true PORT=8443 $(GO) run -race main.go

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

deploy:
	scp -o Cipher=arcfour dist/prscd2-linux-arm v2-zipper-sgp-arm:prscd.v2/prscd2-1205
