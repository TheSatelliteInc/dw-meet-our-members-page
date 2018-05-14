(function(window, document) { 'use strict';
  window.showOurMemberModal = function(modalTpl, member) {
    var dom = {};

    (function init() {
      dom.modal = modalTpl.cloneNode(true);
      applySelectors(dom);
      bindEvents(dom);
      openDialog();
      renderData();
    })();

    function renderData() {
      if(member.photo) dom.img.src = member.photo;
      else dom.photo.parentElement.removeChild(dom.photo);
      dom.name.textContent = member.name || '';
      dom.occupation.textContent = member.occupation || '';
      dom.company.textContent = member.company || '';

      var emails = member.fields.filter(function(field) { return field.type === 'email'; });
      var phones = member.fields.filter(function(field) { return field.type === 'phone'; });
      var urls = member.fields.filter(function(field) { return field.type === 'url'; });
      var fields = member.fields.filter(function(field) { return ['email', 'phone', 'url'].indexOf(field.type) < 0; });

      if(member.email) emails.unshift({ value: member.email });

      if(emails.length) {
        emails.forEach(function(field) {
          var email = dom.emailTpl.cloneNode(true);
          var link = email.querySelector('a');
          link.href = 'mailto:' + field.value;
          link.textContent = field.value;
          link.title = field.name;
          dom.emails.appendChild(email);
        });
      } else {
        dom.contacts.removeChild(dom.emails);
      }

      if(phones.length) {
        phones.forEach(function(field) {
          var phone = dom.phoneTpl.cloneNode(true);
          var link = phone.querySelector('a');
          link.href = 'tel:' + field.value;
          link.textContent = field.value;
          link.title = field.name;
          dom.phones.appendChild(phone);
        });
      } else {
        dom.contacts.removeChild(dom.phones);
      }

      if(!emails.length && !phones.length) dom.details.removeChild(dom.contacts);

      if(urls.length) {
        assignUrlIcons(urls);
        urls.forEach(function(field) {
          var url = dom.urlTpl.cloneNode(true);
          var icon = url.querySelector('.fa');
          var link = url.querySelector('a');
          setClass(icon, field.icon);
          link.href = field.value;
          link.title = field.name;
          dom.urls.appendChild(url);
        });
      } else {
        dom.details.removeChild(dom.urls);
      }

      fields.forEach(function(field) {
        var omField = dom.fieldTpl.cloneNode(true);
        var omName = omField.querySelector('.om-field-name');
        var omValue = omField.querySelector('.om-field-value');
        omName.textContent = field.name + ':';
        omValue.textContent = field.value;
        dom.body.appendChild(omField);
      });
    }

    function assignUrlIcons(urls) {
      urls.forEach(function(field) {
        var name = (field.name || '').toLowerCase();
        var value = (field.value || '').toLowerCase();
        if(name.indexOf('facebook') >= 0 || value.indexOf('facebook.com') >= 0) field.icon = 'fa-facebook-square';
        else if(name.indexOf('twitter') >= 0 || value.indexOf('twitter.com') >= 0) field.icon = 'fa-twitter-square';
        else if(name.indexOf('linkedin') >= 0 || value.indexOf('linkedin.com') >= 0) field.icon = 'fa-linkedin-square';
        else if(name.indexOf('github') >= 0 || value.indexOf('github.com') >= 0) field.icon = 'fa-github-square';
        else if(name.indexOf('youtube') >= 0 || value.indexOf('youtube.com') >= 0) field.icon = 'fa-youtube-square';
        else if(name.indexOf('vimeo') >= 0 || value.indexOf('vimeo.com') >= 0) field.icon = 'fa-vimeo-square';
        else if(name.match(/google(?:\s|-)?(?:plus|\+)/) || value.indexOf('plus.google.com') >= 0) field.icon = 'fa-google-plus-square';
        else field.icon = 'fa-globe';
      });
    }

    function applySelectors() {
      dom.cross = dom.modal.querySelector('.om-modal-cross');
      dom.fade = dom.modal.querySelector('.om-modal-fade');
      dom.photo = dom.modal.querySelector('.om-photo');
      dom.img = dom.photo.querySelector('img');
      dom.name = dom.modal.querySelector('.om-name');
      dom.occupation = dom.modal.querySelector('.om-occupation');
      dom.company = dom.modal.querySelector('.om-company');
      dom.body = dom.modal.querySelector('.om-modal-scroll');
      dom.fieldTpl = dom.modal.querySelector('.om-field');
      dom.body.removeChild(dom.fieldTpl);
      dom.details = dom.modal.querySelector('.om-details');
      dom.contacts = dom.modal.querySelector('.om-contacts');
      dom.emails = dom.contacts.querySelector('.om-emails');
      dom.emailTpl = dom.emails.querySelector('.om-email');
      dom.emails.removeChild(dom.emailTpl);
      dom.phones = dom.contacts.querySelector('.om-phones');
      dom.phoneTpl = dom.phones.querySelector('.om-phone');
      dom.phones.removeChild(dom.phoneTpl);
      dom.urls = dom.modal.querySelector('.om-urls');
      dom.urlTpl = dom.urls.querySelector('.om-url');
      dom.urls.removeChild(dom.urlTpl);
    }

    function bindEvents() {
      dom.cross.addEventListener('click', closeDialog);
      dom.fade.addEventListener('click', closeDialog);
    }

    function openDialog() {
      document.body.appendChild(dom.modal);
      setTimeout(function() {
        setClass(document.body, 'om-modal-open');
      });
    }

    function closeDialog() {
      setClass(document.body, 'om-modal-open', false);
      setTimeout(function() {
        document.body.removeChild(dom.modal);
      }, 150);
    }

    function setClass(element, className, op) {
      if(op !== false) op = true;
      var arr = element.className.split(' ');
      var idx = arr.indexOf(className);
      if(op && idx < 0) arr.push(className);
      else if(!op && idx >= 0) arr.splice(idx, 1);
      element.className = arr.join(' ');
    }
  };
})(window, document);
