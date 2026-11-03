---
permalink: /
author_profile: false
redirect_from: 
  - /about/
  - /about.html
---

{% include base_path %}

<section class="profile">
  <img class="profile__photo" src="{{ base_path }}/images/{{ site.author.avatar }}" alt="Photo of {{ site.author.name }}" width="150" height="150">
  <div class="profile__text">
    <h1 class="profile__name">{{ site.author.name }}</h1>
    <p class="profile__role">PhD Student in Operations Research<br>Columbia University</p>
    <ul class="profile__links">
      <li><a href="mailto:{{ site.author.email }}"><i class="fas fa-envelope" aria-hidden="true"></i>Email</a></li>
      <li><a href="https://github.com/{{ site.author.github }}"><i class="fab fa-github" aria-hidden="true"></i>GitHub</a></li>
      <li><a href="{{ base_path }}/files/Weizhong_Wang_CV.pdf"><i class="fas fa-file-lines" aria-hidden="true"></i>CV</a></li>
    </ul>
  </div>
</section>

I am a first-year PhD student advised by [Prof. Henry Lam](https://www.columbia.edu/~khl2114/). My research lies at the intersection of applied probability and statistics, control, and (stochastic) differential equations. Recently I have been working on diffusion models for rare events, from classical rare-event problems to biomolecular systems, and on watermarking for large language models.

I received my B.S. in Mathematics and Applied Mathematics from Fudan University. During my undergraduate studies, I was fortunate to be advised by [Prof. Yiping Lu](https://2prime.github.io/) and [Prof. Kaizheng Wang](https://kw2934.github.io/). I am also deeply grateful to [Prof. Yingzhou Li](https://yingzhouli.com/) for his generous guidance and support throughout my academic journey.

## Research

<div class="research">
  <ul class="research__list">
    <li><strong>Rare events with diffusion models</strong><span>Classical rare-event problems and biomolecular systems</span></li>
    <li><strong>Watermarking</strong><span>Watermarks for large language models</span></li>
    <li><strong>Sampling and inference-time scaling</strong><span>SMC and importance sampling on path space</span></li>
    <li><strong>Foundations</strong><span>Applied probability, stochastic control, SDEs</span></li>
  </ul>
  <div class="research__art" aria-hidden="true">
    <img class="art-light" src="{{ base_path }}/images/landscape-light.svg" alt="" width="398" height="175">
    <img class="art-dark" src="{{ base_path }}/images/landscape-dark.svg" alt="" width="398" height="175">
  </div>
</div>

## News

<ul class="news">
  <li><span class="news__date">Aug 2026</span><span>Started my PhD at Columbia University.</span></li>
  <li><span class="news__date">May 2026</span><span>Our paper <a href="https://arxiv.org/abs/2605.17850">URGE</a> (ICML 2026) is on arXiv.</span></li>
</ul>

## Selected Publications

<div class="pubs">
{% assign selected = site.publications | where: "selected", true | reverse %}{% for pub in selected %}{% include pub-entry.html pub=pub %}{% endfor %}
</div>

<p class="pub-note">* Equal contribution · <a href="{{ base_path }}/publications/">All publications</a></p>
