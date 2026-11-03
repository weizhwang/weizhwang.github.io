---
layout: site
permalink: /
redirect_from:
  - /about/
  - /about.html
---

{% include base_path %}

<section class="hero">
<div class="hero__text">
<h1 class="hero__name">{{ site.author.name }}</h1>
<p class="hero__role">PhD Student in Operations Research<br>Columbia University</p>
<ul class="hero__links">
<li><a href="mailto:{{ site.author.email }}">{% include icon.html name="mail" %}Email</a></li>
<li><a href="https://github.com/{{ site.author.github }}">{% include icon.html name="github" %}GitHub</a></li>
{%- if site.author.googlescholar %}
<li><a href="{{ site.author.googlescholar }}">{% include icon.html name="scholar" %}Google Scholar</a></li>
{%- endif %}
<li><a href="{{ base_path }}/files/Weizhong_Wang_CV.pdf">{% include icon.html name="file" %}CV</a></li>
</ul>
</div>
<img class="hero__photo" src="{{ base_path }}/images/{{ site.author.avatar }}" alt="Photo of {{ site.author.name }}" width="168" height="168">
</section>

<div class="prose" markdown="1">

I am a first-year PhD student advised by [Prof. Henry Lam](https://www.columbia.edu/~khl2114/) and [Prof. Adam Block](https://abblock.github.io/). My research lies at the intersection of applied probability and statistics, control, and (stochastic) differential equations. Recently I have been working on diffusion models for rare events, from classical rare-event problems to biomolecular systems, and on watermarking for large language models.

I received my B.S. in Mathematics and Applied Mathematics from Fudan University. During my undergraduate studies, I was fortunate to be advised by [Prof. Yiping Lu](https://2prime.github.io/) and [Prof. Kaizheng Wang](https://kw2934.github.io/). I am also deeply grateful to [Prof. Yingzhou Li](https://yingzhouli.com/) for his generous guidance and support throughout my academic journey.

</div>

<section class="section">
<h2 class="section__title">Research</h2>
<div class="research">
<ul class="topics">
<li><h3>Rare events with diffusion models</h3><p>Classical rare-event problems and biomolecular systems</p></li>
<li><h3>Watermarking</h3><p>Watermarks for large language models</p></li>
<li><h3>Sampling and inference-time scaling</h3><p>SMC and importance sampling on path space</p></li>
<li><h3>Foundations</h3><p>Applied probability, stochastic control, SDEs</p></li>
</ul>
<div class="research__art" aria-hidden="true">
<img class="art-light" src="{{ base_path }}/images/landscape-light.svg?v={{ site.time | date: "%s" }}" alt="" width="398" height="222">
<img class="art-dark" src="{{ base_path }}/images/landscape-dark.svg?v={{ site.time | date: "%s" }}" alt="" width="398" height="222">
</div>
</div>
<script src="{{ base_path }}/assets/js/bowl.js?v={{ site.time | date: "%s" }}" defer></script>
</section>

<section class="section">
<h2 class="section__title">News</h2>
<ul class="news">
<li><time datetime="2026-08">Aug 2026</time><span>Started my PhD at Columbia University.</span></li>
<li><time datetime="2026-05">May 2026</time><span>Our paper <a href="https://arxiv.org/abs/2605.17850">URGE</a> (ICML 2026) is on arXiv.</span></li>
</ul>
</section>

<section class="section">
<h2 class="section__title">Selected publications</h2>
{% assign selected = site.publications | where: "selected", true | reverse %}{% for pub in selected %}{% include pub-entry.html pub=pub %}{% endfor %}
<p class="note">* Equal contribution · <a href="{{ base_path }}/publications/">All publications</a></p>
</section>
