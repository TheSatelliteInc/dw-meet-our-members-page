Embeddable Meet Our Members page
--------------------------------

To integrate it into any HTML page of you site:

- copy `assets` folder with all files inside;
- add the following code to your HTML page:
``` html
<div id="our-members" data-api-url="https://thesatellite.satellitedeskworks.com" data-assets-prefix="assets/"></div>
<script src="assets/our-members.js"></script>
```

##### Configuration
- URL of your DeskWorks site for API calls:
`data-api-url="https://thesatellite.satellitedeskworks.com"`
- Assets prefix defines subfolder for assets:
`data-assets-prefix="assets/"`
