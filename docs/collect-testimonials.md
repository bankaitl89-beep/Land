# Collecting testimonials

The landing page renders its testimonials section only when
`content[lang].testimonials.items` is non-empty. Leave it empty until real,
attributed quotes exist — invented ones are illegal advertising in the US
(FTC 16 CFR Part 465), the EU (UCPD 2005/29/EC Annex I) and Russia
(ФЗ «О рекламе», ст. 5), and a single request for the person's contact
details ends the sale.

## What a usable testimonial contains

Four parts, in this order of importance:

1. **A number.** "Cut my weekly report from four hours to twenty minutes."
   A quote without one is decoration.
2. **A before state.** What the person did instead, previously.
3. **A real name and role.** "Anna K., marketing lead at a logistics firm"
   beats "A happy student". A surname initial is fine; anonymity is not.
4. **Permission**, in writing, to publish all of the above.

## The email that gets them

Send this to everyone who finished. Expect roughly one usable reply in five,
so send at least fifteen to end up with three.

> Subject: two questions about the course
>
> Hi <name>,
>
> You finished the program a while back and I'd like to know whether it
> actually stuck — honestly, including if it didn't.
>
> Two questions:
>
> 1. Is there anything you built during the course that you still use? What
>    is it, and roughly how long did that task take you before?
> 2. What almost stopped you from signing up?
>
> Two or three sentences is plenty. If your answer to the first one is
> useful to someone deciding right now, may I quote it on the site with your
> name and job title? Say no and it stays between us — I'll still be glad
> to hear the answer.
>
> Thanks,
> <your name>

Question 2 matters as much as question 1: the answers tell you which
objection to put in the FAQ, in the words people actually use.

## Adding them to the page

Fill the `items` array for each language in `lib/content.ts`. Keep the
person's own wording — tidy the grammar, never rewrite the meaning. If they
wrote in Russian and the page shows English, translate and say so.

```ts
testimonials: {
  eyebrow: "Graduates",
  title: "What people say after week four",
  items: [
    {
      result: "4 hours → 20 minutes",       // the number, shown large
      quote: "I still use the report process every Monday. It used to eat
              my whole morning; now I read it, fix a line, and send it.",
      name: "Anna K.",
      role: "Marketing lead, logistics",
    },
  ],
},
```

The section appears by itself as soon as the first entry lands.

## While you have none

Honest substitutes that work today, in order of strength:

- **Screenshots of the platform.** Shows the method is real. Already
  wired into the page — it's waiting for the images.
- **A real reviewed homework submission**, published with the author's
  permission and their name removed from the screenshot. Proves the review
  step happens.
- **A free first lesson.** Removes the risk a testimonial would have
  removed, and costs nothing but delivery.
- **A discount for the first ten in exchange for a written review.** This
  is how you get the testimonials in the first place, and it is legitimate
  as long as the incentive is disclosed where the reviews appear.
