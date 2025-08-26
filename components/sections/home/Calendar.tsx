import Coincidence from '@/components/Coincidence'
import MyCrossword from '@/components/MyCrossword'

export default function Calendar() {
  return (
    <section
      className="container mx-auto mb-8 rounded-xl border border-t border-b border-secondary-300"
      id="calendar"
    >
      <div className="grid grid-cols-1 gap-8 p-10 md:grid-cols-2">
        <div>
          <h2 className="mb-8 text-2xl font-bold text-secondary-200">
            What is Metagame?
          </h2>
          <p className="mb-4 font-semibold">
            Metagame is a weekend conference devoted to games. We mean games in
            the broadest sense of the word: any experience that is designed to
            be played, as opposed to passively consumed. This includes board
            games, card games, videogames, tabletop games, LARPs, puzzles, rock
            climbing routes, and more. If building it involves asking the
            question &quot;what would the consumer of this experience choose to
            do next?&quot;, it&apos;s a game.
            <br />
            <br />
            My guess is the event will lean extremely toward the &quot;communal,
            chaotic, unconference-y&quot; end of the professionalism spectrum,
            with a lot of the [sessions? experiences? internal plot devices?]
            designed by attendees.
            <br />
            <br />
            This is not a <Coincidence />, because nothing is ever a{' '}
            <Coincidence />.
          </p>
        </div>
        <div>
          <MyCrossword />
        </div>
      </div>
    </section>
  )
}
