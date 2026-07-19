import net from 'node:net'

const port = Number.parseInt(process.env.QA_PORT ?? '4174', 10)
const host = '127.0.0.1'

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid QA_PORT: ${process.env.QA_PORT ?? ''}`)
  process.exit(1)
}

const server = net.createServer()

server.once('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`QA port ${host}:${port} is already in use; refusing to test against an unknown server.`)
  } else {
    console.error(`Unable to verify QA port ${host}:${port}:`, error)
  }
  process.exit(1)
})

server.listen(port, host, () => {
  server.close((error) => {
    if (error) {
      console.error(`Unable to release QA port ${host}:${port}:`, error)
      process.exit(1)
    }
    console.log(`QA port ${host}:${port} is available.`)
  })
})
