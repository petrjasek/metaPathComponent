

# metaPath


##base setup:

link all required bundles at the bottom of the page
```
<script type="text/javascript" src="runtime.a66f828dca56eeb90e02.js"></script>
<script type="text/javascript" src="polyfills.b4daf421c94934f530d4.js"></script>
<script type="text/javascript" src="scripts.69c39fe5fecacc5138f1.js"></script>
<script type="text/javascript" src="main.d58ef66a7ca6fd185741.js"></script>
```
(has is changing every build)


## config

```javascript
var metapathConfig = {
    
    // unique identification
    pathId: 'seznamovani',
    
    // absolute path to background image
    backgroundImageUrl: '/assets/scene/pastva/pastva-bg.jpg',
    
    // absolute path to player image (sprite)
    playerAnimationUrl: '/assets/scene/pastva/player.png',

    // path colors setup
    path: {
      color: '#d8bcb0', // path background color
      outline: '#89756e', // path outline color
      pinNext: '#d8d16b', // pins to the left
      pinPrev: '#7a8868', // pins done, to the right
      pinCurrent: '#d88e55' // pin color (current, where player is standing)
    },

    // animation layers (optional)
    
    // layer: some id or name
    // asset: absolute url to spritesheet
    // anim: animation preset (left-right, right-left, none, left-blip, right-blip)
    // spriteanim: true | false - disable/enable sprite frame animations (all sprites have 3 frames (150x150)
    // position: x: y:
    //    absolute  postion of the sprite, or define only y offset for animated sprites (anim is not 'none')     
     
    layers: [
      {layer: 'butterfly', asset:'/assets/tmp/sprite150.jpg', anim: 'left-right', position: {x: 0, y:600}},
      {layer: 'butterflyA', asset:'/assets/tmp/sprite3x150.png', anim: 'right-left', spriteanim: true},
      {layer: 'butterflyB', asset:'/assets/tmp/sprite3x150.jpg', anim: 'none', position: {x: 200, y:400}, spriteanim: true},
      {layer: 'butterflyC', asset:'/assets/tmp/sprite3x150.jpg', anim: 'left-blip', position: {y:400}, spriteanim: true},
      {layer: 'butterflyD', asset:'/assets/tmp/sprite3x150.jpg', anim: 'right-blip', position: {y:200}, spriteanim: true},
    ],
    
    
    // path points
    // this array of objects generates the path
    // type: type of the point (not used now, for future display different point styles eg. test)
    // url: url of the task (click to the point is causing redirect to page with tasks)    
    pathpoints: [
      {type: 'default', url: 'http://www.seznam.cz'},
      {type: 'default', url: 'http://www.google.cz'},
      {type: 'test', url: 'url3'},
      {type: 'default', url: 'url4'},
      {type: 'default', url: 'pointURL'},
      {type: 'default', url: 'pointURL'},
      {type: 'default', url: 'pointURL'},
      {type: 'default', url: 'pointURL'},
      {type: 'default', url: 'pointURL'},
      {type: 'default', url: 'pointURL'},
      {type: 'default', url: 'pointURL'},
      {type: 'default', url: 'pointURL'},
      {type: 'default', url: 'pointURL'},
      {type: 'default', url: 'pointURL'},
      {type: 'default', url: 'pointURL'}
    ]
  };
```


## include component to the page

```html
<meta-path config="metapathConfig" startindex="3" redirect="false"></meta-path>
```

- put the component to your page
- config attr: link the config of the component
- startindex attr: set the current index of the player 
- redirect attr: 
    - true (default) each point is redirecting user to its url
    - false stop redirecting, only debug url to console 
