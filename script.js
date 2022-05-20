const rc = chars => chars[Math.floor(Math.random() * chars.length)]
const defaultOptions = {
  time: 3000,
  cycle: true,
  characters: '!@#$%^&*-_=+\\/',
  chance: 0.5,
  fpsCounter: null
}

class Scrambler {
  constructor(text, element, options = {}) {
    // Reverse the string array so that text is displayed the order it was provided
    this.text = text
    this.element = element
    this.options = Object.assign({}, defaultOptions, options)

    this.updateFrame = this.updateFrame.bind(this)
  }

  start(stopAfter = 0) {
    // Keep track of the words displayed already
    this.history = []
    this.stopped = false
    let totalCycles = 0

    const iterate = (iteration = 0) => {
      if (stopAfter && stopAfter > 0 && totalCycles >= stopAfter) {
        this.stop()
      }

      return setTimeout(() => {
        this.queuePhrase(this.text[iteration], iteration)
        this.history.push(this.text[iteration])
        totalCycles++

        if (!this.stopped) iterate((iteration + 1) % this.text.length)
      }, this.options.time)
    }

    // Start recursing
    this.timeout = iterate()

    return () => {
      this.stop()
    }
  }

  stop() {
    this.stopped = true

    if (this.timeout) clearTimeout(this.timeout)
  }

  queuePhrase(phrase, iteration) {
    this.queue = []
    this.frame = 0

    const lastPhrase = this.history.pop() || ''
    let longer =
      lastPhrase.length > phrase.length ? lastPhrase.length : phrase.length

    for (let i = 0; i < longer; i++) {
      const oldCharacter = lastPhrase[i] || ''
      const newCharacter = phrase[i] || ''

      // Start transforming chars within the first 50 frames and
      // end somewhere within 50 frames after starting transforms.
      const startTransformation = Math.floor(Math.random() * 30)
      const endTransformation =
        Math.floor(Math.random() * 30) + startTransformation

      this.queue.push({
        oldCharacter,
        newCharacter,
        startTransformation,
        endTransformation
      })
    }

    cancelAnimationFrame(this.nextFrame)
    this.updateFrame()
  }

  updateFrame() {
    let display = ''
    let char
    let charactersProcessed = 0

    this.queue = this.queue.map(process => {
      const {
        oldCharacter,
        newCharacter,
        startTransformation,
        endTransformation,
        character
      } = process

      if (this.frame < startTransformation) {
        display += oldCharacter

        return process
      }

      if (this.frame > endTransformation) {
        display += newCharacter
        charactersProcessed++

        return process
      }

      // If there is a character just display it.
      if (character) {
        char = character
        display += `<span style="color: pink;">${character}</span>`
        return process
      }

      if (Math.random() <= this.options.chance) {
        char = rc(this.options.characters)
      }

      display += `${oldCharacter}`

      return Object.assign({}, process, { character: char })
    })

    this.updateElement(display)

    if (charactersProcessed !== this.queue.length) {
      this.nextFrame = requestAnimationFrame(this.updateFrame)
      this.frame++
    }
  }

  updateElement(text) {
    this.element.innerHTML = text
  }
}

const text = [
  'No Chill',
  'Got swag?',
  'Supreme X Bape X KITH',
  'Hypebeast Culture',
  'Yolo Swag'
]

const scrambler = new Scrambler(text, document.querySelector('.text'), {
  characters: '/\\|****'
})

// start() returns the function to stop()
const stop = scrambler.start()
