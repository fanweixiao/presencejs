//go:build windows
// +build windows

package main

import (
	"os"
	"os/signal"
	"syscall"
)

func register_os_signal(c chan os.Signal) {
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)
	log.Info("Listening SIGTERM/SIGINT...")
	for p1 := range c {
		log.Info("Received signal: %s", p1)
		os.Exit(0)
	}
}
