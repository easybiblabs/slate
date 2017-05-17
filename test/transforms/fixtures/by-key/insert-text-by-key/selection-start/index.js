
import assert from 'assert'

export default function (state) {
  const { document, selection } = state
  const texts = document.getTexts()
  const firstText = texts.first()

  const nextSelection = selection.merge({
    anchorKey: firstText.key,
    focusKey: firstText.key,
    anchorOffset: 2,
    focusOffset: 4
  })

  const next = state
    .transform()
    .select(nextSelection)
    .insertTextByKey(firstText.key, 2, 'XX')
    .apply()

  assert.deepEqual(
    next.selection.toJS(),
    nextSelection.merge({
      anchorOffset: 4,
      focusOffset: 6
    }).toJS()
  )

  return next
}
