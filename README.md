# reveal.js-visualization

## Demo

A demo is available [here](https://chatziko.github.io/reveal.js-visualization/).

## Install

```
npm install
npx webpack
```
Then open `demo/index.html`.

To use in your presentation copy `plugin/visualization/visualization.js` to your
presentation directory, and load it when initialization reveal.js:
```
<script>
    Reveal.initialize({
        ...
        dependencies: [
            { src: 'plugin/visualization/visualization.js', async: true }
        ]
    });
</script>
```