---
layout: page.njk
permalink: index.html
templateEngineOverride: njk
eleventyImport:
  collections: [weddingSections]
sections:
  - home
  - rsvp
  - story
  - stay
  - schedule
  - registry
  - travel
  - questions
---
{% for id in sections %}
{% set block = collections.weddingSections | sectionById(id) %}
{% include "panels/" + block.data.panel + ".njk" %}
{% endfor %}
