import { build} from '../helper'
import Fastify from 'fastify'
import Support from '../../plugins/support/support'

test('support works standalone', async () => {
  const testApp = build()
  // void testApp.register(Support)
  await testApp.ready()

  expect(testApp.someSupport()).toBe('hugs')


})
