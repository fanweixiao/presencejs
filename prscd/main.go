// package main start the service
package main

import (
	"crypto/tls"
	"fmt"
	"os"
	"os/signal"
	"runtime"
	"syscall"

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

	// Ctrl-C or kill <pid> graceful shutdown
	// - `kill -SIGUSR1 <pid>` customize
	// - `kill -SIGTERM <pid>` graceful shutdown
	// - `kill -SIGUSR2 <pid>` inspect golang GC
	log.Info("pid: %d", os.Getpid())
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

	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGUSR2, syscall.SIGUSR1, syscall.SIGINT)
	log.Info("Listening SIGUSR1, SIGUSR2, SIGTERM/SIGINT...")
	for p1 := range c {
		log.Info("Received signal: %s", p1)
		if p1 == syscall.SIGTERM || p1 == syscall.SIGINT {
			log.Info("graceful shutting down ... %s", p1)
			os.Exit(0)
		} else if p1 == syscall.SIGUSR2 {
			// kill -SIGUSR2 <pid> will write ystat logs to /tmp/conns.log
			chirp.DumpConnectionsState()
			var m runtime.MemStats
			runtime.ReadMemStats(&m)
			fmt.Printf("\tNumGC = %v\n", m.NumGC)
		} else if p1 == syscall.SIGUSR1 {
			log.Info("SIGUSR1")
			chirp.DumpNodeState()
		}
	}
}
