'use strict'

const { test } = require('tap')
const { setup, connect, subscribe, noError } = require('./helper')

test('multiple same tick QoS 1 publishes with overlapping subs does not error', function (t) {
  t.plan(8)

  const s = noError(connect(setup(), { clean: false }), t)
  t.tearDown(s.broker.close.bind(s.broker))

  subscribe(t, s, 'hello/world', 1, function () {
    subscribe(t, s, 'hello/+', 1, function () {
      s.outStream.once('data', function (packet) {
        t.ok(packet, 'first packet received')
        s.outStream.once('data', function (packet) {
          t.ok(packet, 'second packet received')
        })
      })

      s.broker.publish({
        topic: 'hello/world',
        payload: 'world',
        qos: 1
      })
      s.broker.publish({
        topic: 'hello/world',
        payload: 'world',
        qos: 1
      })
    })
  })
})
