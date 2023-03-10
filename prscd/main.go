// package main start the service
package main

import (
	"crypto/tls"
	"fmt"
	"os"

	"yomo.run/prscd/chirp"
	"yomo.run/prscd/util"
	"yomo.run/prscd/websocket"
	"yomo.run/prscd/webtransport"

	"github.com/joho/godotenv"
	"github.com/yomorun/yomo"
)

var log = util.Log

func main() {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal(err)
	}

	chirp.CreateNodeSingleton()

	if os.Getenv("DEBUG") == "true" {
		chirp.Node.Env = "development"
		log.SetLogLevel(util.DEBUG)
		log.Debug("IN DEVELOPMENT ENV")
	}

	sndr := yomo.NewSource(os.Getenv("YOMO_SNDR_NAME"), yomo.WithZipperAddr(os.Getenv("YOMO_ZIPPER_ADDR")))
	rcvr := yomo.NewStreamFunction(os.Getenv("YOMO_RCVR_NAME"), yomo.WithZipperAddr(os.Getenv("YOMO_ZIPPER_ADDR")))

	chirp.Node.ConnectToYoMo(sndr, rcvr)

	certFile := os.Getenv("CERT_FILE")
	keyFile := os.Getenv("KEY_FILE")

	// 加载证书
	cert, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		log.Fatal(err)
	}
	config := &tls.Config{
		Certificates: []tls.Certificate{cert},
		NextProtos:   []string{"http/1.1", "h2", "h3", "http/0.9", "http/1.0", "spdy/1", "spdy/2", "spdy/3"},
	}

	// default addr and port listening
	addr := "0.0.0.0:443"
	if os.Getenv("PORT") != "" {
		addr = fmt.Sprintf("0.0.0.0:%s", os.Getenv("PORT"))
	}

	// start WebSocket listener
	go websocket.ListenAndServe(addr, config)

	// start WebTransport listener
	go webtransport.ListenAndServe(addr, config)

	// start Probe Server for AWS health check
	go startProbeServer(61226)

	// Ctrl-C or kill <pid> graceful shutdown
	// - `kill -SIGUSR1 <pid>` customize
	// - `kill -SIGTERM <pid>` graceful shutdown
	// - `kill -SIGUSR2 <pid>` inspect golang GC
	log.Info("PID: %d", os.Getpid())
	// write pid to ./prscd.pid, overwrite if exists
	pidFile := "./prscd.pid"
	f, err := os.OpenFile(pidFile, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()
	_, err = f.WriteString(fmt.Sprintf("%d", os.Getpid()))
	if err != nil {
		log.Fatal(err)
	}

	log.Debug("Prscd Dev Server is running on https://lo.yomo.dev:8443/v1")

	c := make(chan os.Signal, 1)
	register_os_signal(c)
}
