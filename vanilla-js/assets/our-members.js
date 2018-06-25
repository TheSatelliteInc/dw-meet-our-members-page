(function(window, document) { 'use strict';
  var dom = {};
  var members, offset, limit = 100, eof;
  var apiUrl, assetsPrefix;
  var container;

  (function init() {
    container = document.getElementById('our-members');
    apiUrl = container.dataset.apiUrl;
    assetsPrefix = container.dataset.assetsPrefix || '';
    injectStyles([
      assetsPrefix + 'our-members.css',
      assetsPrefix + 'our-members-modal.css',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css',
    ]);
    injectScripts([assetsPrefix + 'infinite-scroll.js', assetsPrefix + 'our-members-modal.js'], onScriptsLoad);
  })();

  function onScriptsLoad() {
    loadTemplate(assetsPrefix + 'our-members.html', function(element) {
      dom.mainTpl = element;
      if(dom.modalTpl) onTemplatesLoad();
    });
    loadTemplate(assetsPrefix + 'our-members-modal.html', function(element) {
      dom.modalTpl = element;
      if(dom.mainTpl) onTemplatesLoad();
    });
  }

  function onTemplatesLoad() {
    container.appendChild(dom.mainTpl);

    reset();
    applySelectors(dom);
    dom.members.removeChild(dom.memberTpl);
    bindEvents(dom);

    xhr('GET', apiUrl + '/api/v1/centers', onCenters);

    window.infiniteScroll({ distance: 1500, callback: onScroll });
  }

  function applySelectors(dom) {
    dom.members = document.querySelector('.om-members');
    dom.memberTpl = dom.members.querySelector('.om-member');
    dom.spin = dom.members.querySelector('.om-spin');
    dom.nobody = document.querySelector('.om-nobody');
    dom.toolbar = document.querySelector('.om-toolbar');
    dom.center = dom.toolbar.querySelector('select[name="center"]');
    dom.sort = dom.toolbar.querySelector('select[name="sort"]');
    dom.search = dom.toolbar.querySelector('input[name="search"]');
  }

  function bindEvents(dom) {
    dom.center.addEventListener('change', onFilterChange);
    dom.sort.addEventListener('change', onFilterChange);
    dom.search.addEventListener('input', debounce(onFilterChange, 1000));
    dom.toolbar.addEventListener('submit', function(event) { event.preventDefault(); });
  }

  function reset() {
    members = [];
    offset = 0;
    eof = false;
    if(dom.members) {
      dom.members.querySelectorAll('.om-member')
        .forEach(function(element) { element.remove(); });
    }
  }

  function onFilterChange(event) {
    reset();
    onScroll();
  }

  function onScroll(done) {
    if(eof) return;
    setClass(dom.spin, 'om-hidden', false);
    setClass(dom.nobody, 'om-hidden');
    var params = ['offset=' + offset, 'limit=' + limit, 'sort=' + dom.sort.value];
    if(dom.center.value) params.push('centerId=' + dom.center.value);
    if(dom.search.value) params.push('q=' + encodeURIComponent(dom.search.value));
    xhr('GET', apiUrl + '/api/v1/our-members?' + params.join('&'), function(members) {
      onMembers(members);
      if(done) done();
    });
  }

  function onCenters(centers) {
    centers.forEach(function(center) {
      var opt = document.createElement('option');
      opt.value = center.id;
      opt.textContent = center.name;
      dom.center.appendChild(opt);
    });
  }

  function onMembers(result) {
    result.forEach(function(member, idx) {
      var omMember = dom.memberTpl.cloneNode(true);
      var omPhoto = omMember.querySelector('.om-photo');
      var omImg = omPhoto.querySelector('img');
      var omName = omMember.querySelector('.om-name');
      var omOccupation = omMember.querySelector('.om-occupation');

      omMember.addEventListener('click', onClickMember);
      omMember.setAttribute('data-idx', members.length + idx);

      omName.textContent = member.name;

      if(member.photo) omImg.src = member.photo;
      else omPhoto.removeChild(omImg);

      if(member.occupation) omOccupation.textContent = member.occupation;
      else omMember.removeChild(omOccupation);

      dom.members.insertBefore(omMember, dom.spin);
    });

    members = members.concat(result);
    offset += result.length;
    eof = result.length < limit;

    setClass(dom.spin, 'om-hidden');
    setClass(dom.nobody, 'om-hidden', !!members.length || !eof);
  }

  function onClickMember(event) {
    var el = event.target, i = 5;
    while(el.className.indexOf('om-member') < 0 && i) { el = el.parentElement; i--; }
    window.showOurMemberModal(dom.modalTpl, members[el.dataset.idx]);
  }

  function injectStyles(paths) {
    paths.forEach(function(path) {
      var link = document.head.querySelector('link[href="' + path + '"]');
      if(link) return;
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path;
      link.type = 'text/css';
      document.head.appendChild(link);
    });
  }

  function injectScripts(paths, callback) {
    var finished = Array.apply(null, Array(paths.length)).map(Boolean.prototype.valueOf, false);
    paths.forEach(function(path, idx) {
      var script = document.body.querySelector('script[src="' + path + '"]');
      if(script) { finished[idx] = true; return; }
      script = document.createElement('script');
      script.src = path;
      document.body.appendChild(script);
      if(!callback) return;
      script.addEventListener('load', function() {
        finished[idx] = true;
        if(finished.every(function(fin) { return fin; })) callback();
      });
      script.addEventListener('error', function(event) {
        console.error('ERROR: cannot load', event.target && event.target.src, 'script.');
      });
    });
  }

  function loadTemplate(path, callback) {
    xhr('GET', path, function(html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      callback(tmp.childNodes[0]); // loaded template should have only one root
    });
  }

  function setClass(element, className, op) {
    if(op !== false) op = true;
    var arr = element.className.split(' ');
    var idx = arr.indexOf(className);
    if(op && idx < 0) arr.push(className);
    else if(!op && idx >= 0) arr.splice(idx, 1);
    element.className = arr.join(' ');
  }

  function xhr(method, url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4) {
        if(xhr.status < 200 || xhr.status > 299) return console.error('XHR error', xhr);
        var data;
        try {
          data = JSON.parse(xhr.responseText);
        } catch(err) {
          data = xhr.responseText;
        }
        callback(data);
      }
    };
    xhr.open(method, url);
    xhr.send();
  }

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if(!immediate) return func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if(callNow) return func.apply(context, args);
    };
  }
})(window, document);
