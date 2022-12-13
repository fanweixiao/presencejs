import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import WebTransport from '../webtransport-polyfill';
import dayjs from 'dayjs';

let id = 0;
function log(type = 'i', msg) {
  const t =
    type === 'i' ? 'send to server' : type === 'o' ? 'recived from server' : '';
  return {
    id: ++id,
    type: t,
    msg,
    time: dayjs().format('YYYY-MM-DD HH:mm:ss:SSS'),
  };
}

export default function Home() {
  let [wt, setWt] = useState(null);
  let [logs, setLogs] = useState([]);
  useEffect(() => {
    async function f() {
      if (wt === null) {
        const transport = new WebTransport(
          'https://webtransport-server.herokuapp.com/to_upper_case'
        );

        setWt(transport);

        transport.closed
          .then(() => {
            console.log('connection closed');
          })
          .catch(error => {
            console.log('close connection error: ' + error);
          });

        await transport.ready;

        const writer = transport.datagrams.writable.getWriter();
        const data = 'Hello, WebTransport!';
        writer.write(data);
        setLogs(oldLog => [...oldLog, log('i', data.toString())]);
        writer.close();

        const reader = transport.datagrams.readable.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // reader.releaseLock();
            break;
          }
          setLogs(oldLog => [...oldLog, log('o', value.toString())]);
        }
      }
    }
    f();
  }, [wt]);
  let inputRef = useRef();
  const sendData = async () => {
    const inputEl = inputRef.current;
    const data = inputEl.value;
    if (data) {
      const writer = wt.datagrams.writable.getWriter();
      writer.write(data);
      setLogs(oldLog => [...oldLog, log('i', data)]);
      const reader = wt.datagrams.readable.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        setLogs(oldLog => [...oldLog, log('o', value.toString())]);
      }
      inputEl.value = '';
    }
  };
  return (
    <div style={{ minWidth: '800px', margin: 'auto', width: '600px' }}>
      <Head>
        <title>WebTransport Polyfill Test</title>
        <meta name="description" content="WebTransport Polyfill Test" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/purecss@2.1.0/build/pure-min.css"
          integrity="sha384-yHIFVG6ClnONEA5yB5DJXfW2/KC173DIQrYoZMEtBvGzmf0PKiGyNEqe9N6BNDBH"
          crossOrigin="anonymous"
        />
      </Head>
      <form className="pure-form" onSubmit={e => e.preventDefault()}>
        <fieldset>
          <input ref={inputRef} type="text" />
          <button
            className="pure-button pure-button-primary"
            onClick={sendData}
          >
            send data
          </button>
        </fieldset>
      </form>
      <form className="pure-form"></form>

      <table className="pure-table pure-table-horizontal">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Message</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.type}</td>
              <td>{log.msg}</td>
              <td>{log.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
