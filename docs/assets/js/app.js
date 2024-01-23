/**
 * Innovator Dev - Passion for technology
 *
 * @link https://innovator.dev
 * Copyright 2021-2024 Innovator Dev. All rights reserved.
 */

'use strict';

/**
 * Dialog.js is a multipurpose lightweight highly configurable dialog library.
 *
 * @author Eugen Bușoiu
 * @link https://github.com/eugenb/dialog.js
 *
 * @licence MIT <https://raw.githubusercontent.com/eugenb/dialog.js/master/LICENSE>
 */
class Dialog {

    /**
     * Dialog constructor.
     *
     * @param body Dialog content
     * @param args Dialog arguments
     */
    constructor(body, args) {

        // Default options
        this.options = {

            // Styling classes
            dialogClassName: null,
            dialogPlaceholderClassName: null,

            // Size
            size: {
                x: 0,
                y: 0
            },
            position: {},

            // Automatically trigger dialog show
            autoShow: true,

            // Events
            autoClose: false,
            closeOnEsc: true,
            closeOnOutsideClick: true,

            // Callbacks
            callback: {
                onBeforeShow: null,
                onShow: null,
                onClose: null
            },

            // Attach dialog relative to element
            linkTo: null
        };

        // Extend options
        this.options = Object.assign(this.options, args);

        // Create dialog
        this.create(body);
    }

    /**
     * Checks if given element is a child of given dialog.
     *
     * @param elem Element
     * @param dialog Dialog parent
     * @return {boolean}
     */
    static isChild(elem, dialog) {

        // Get descendents
        let d = dialog.getElementsByTagName('*');
        for (let i = 0; i < d.length; i++) {
            if (d[i] === elem) {
                return true;
            }
        }
        return false;
    }

    /**
     * Close all open dialogs.
     */
    static closeAll() {

        // Close all open dialogs
        document.querySelectorAll('[dialog-id]').forEach(dlg => {
            if (typeof dlg.close === 'function') {
                dlg.close();
            }
        });
    }

    /**
     * Creates dialog.
     *
     * @param body Dialog content
     */
    create(body) {

        // Elements
        this.dlg = document.createElement('div');
        this.dlgPlaceholder = document.createElement('div');

        // Apply default classes
        this.dlgPlaceholder.classList.add('dialog-placeholder');
        this.dlg.classList.add('dialog');

        // Apply given classes
        if (this.options.dialogPlaceholderClassName !== null) {
            this.dlgPlaceholder.classList.add(this.options.dialogPlaceholderClassName);
        }

        if (this.options.dialogClassName !== null) {
            this.dlg.classList.add(this.options.dialogClassName);
        }

        // Set dialog placeholder attributes
        this.dlgPlaceholder.setAttribute('dialog-id', Math.random().toString(36).substring(2, 9));
        this.dlgPlaceholder.style.visibility = 'hidden';

        // Set dialog attributes
        this.dlg.setAttribute('dialog-id', Math.random().toString(36).substring(2, 9));

        // Set dialog body
        this.dlg.innerHTML = body;

        // Append dialog
        document.body.appendChild(this.dlgPlaceholder);

        // Calculate viewport size(s)
        let viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0,
            viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;

        // Render dialog attached to an existing element
        if (this.options.linkTo !== null) {

            // Move dialog next to linkTo element
            this.options.linkTo.parentNode.insertBefore(this.dlg, this.options.linkTo.nextSibling);

            // Set position coordinates based on linked element coords
            this.dlg.style.marginLeft = this.options.position.x !== undefined ? `${this.options.position.x}px` : 0;
            this.dlg.style.marginTop = this.options.position.y !== undefined ? `${this.options.position.y}px` : 0;
        } else {

            // Append dialog to placeholder
            this.dlgPlaceholder.appendChild(this.dlg);

            // Get dialog width
            const dlgStyle = getComputedStyle(this.dlg),
                dlgStyleWidth = dlgStyle.getPropertyValue('width'),
                dlgStyleHeight = dlgStyle.getPropertyValue('height');

            // Calculate sizes
            this.options.size = {
                x: dlgStyleWidth.match(/px/) ?
                    parseInt(dlgStyleWidth.replace(/px/, '')) :
                    dlgStyleWidth.match(/%/) ? (viewportWidth * parseInt(dlgStyleWidth.replace(/%/, ''))) / 100 : this.dlg.offsetWidth,
                y: dlgStyleHeight.match(/px/) ?
                    parseInt(dlgStyleHeight.replace(/px/, '')) :
                    dlgStyleHeight.match(/%/) ? (viewportHeight * parseInt(dlgStyleHeight.replace(/%/, ''))) / 100 : this.dlg.offsetHeight
            };

            // Set position coordinates based on provided values
            this.dlg.style.marginLeft = this.options.position.x !== undefined ? `${this.options.position.x}px` :
                `${(viewportWidth - parseInt(this.options.size.x)) / 2}px`;

            this.dlg.style.marginTop = this.options.position.y !== undefined ? `${this.options.position.y}px` :
                `${(viewportHeight - parseInt(this.options.size.y)) / 2}px`;
        }

        // AutoClose
        if (this.options.autoClose) {
            setTimeout(() => {
                this.close()
            }, parseInt(this.options.autoClose) * 1000);
        }

        // Close dialog on escape
        if (this.options.closeOnEsc) {
            document.addEventListener('keyup', e => {

                let key = e.code,
                    target = e.target;

                if (target.nodeType === 3) {
                    target = target.parentNode;
                }

                if (!/(ArrowUp|ArrowDown|Escape|Space)/.test(key) || /input|textarea/i.test(target.tagName)) {
                    return;
                }

                if (key === 'Escape' && this.isVisible()) {
                    this.close();
                }
            });
        }

        // Close dialog when outside click
        if (this.options.closeOnOutsideClick) {
            this.dlgPlaceholder.addEventListener('click', e => {

                let target = e.target;

                if (this.isVisible() && target !== this.dlg && !Dialog.isChild(target, this.dlg)) {
                    this.close();
                }
            });
        }

        // Show dialog (if autoShow is true)
        if (this.options.autoShow) {
            this.show();
        }
    }

    /**
     * Checks if dialog is visible.
     *
     * @return {boolean}
     */
    isVisible() {
        return this.dlgPlaceholder && (this.dlgPlaceholder.style.visibility === 'visible');
    }

    /**
     * Checks if dialog has been created.
     *
     * @return {boolean}
     */
    isCreated() {
        return this.dlgPlaceholder !== null;
    }

    /**
     * Closes dialog.
     */
    close() {
        // Remove dialog
        if (this.isVisible()) {

            // Trigger onClose callback
            if (typeof this.options.callback.onClose === 'function') {
                this.options.callback.onClose();
            }

            // Remove dialog
            this.dlg.parentNode.removeChild(this.dlg);

            // Remove dialog placeholder
            this.dlgPlaceholder.parentNode.removeChild(this.dlgPlaceholder);
            this.dlgPlaceholder = null;
        }
    }

    /**
     * Show dialog (if hidden)
     */
    show() {
        // Trigger onBeforeShow callback
        if (typeof this.options.callback.onBeforeShow === 'function') {
            this.options.callback.onBeforeShow();
        }

        // Show dialog
        this.dlgPlaceholder.style.visibility = 'visible';

        // Trigger onBeforeShow callback
        if (typeof this.options.callback.onShow === 'function') {
            this.options.callback.onShow();
        }
    }
}

/**
 * Innovator Dev app.
 * @type {{route: (function(): {})}}
 */
const app = (() => {

    /**
     * Enable slide menu.
     */
    function enableSlideMenu() {

        // Slide menu trigger and menu container
        let slideMenuTrigger = document.querySelector('.btn-menu'),
            slideMenu = document.querySelector('.slide-menu');

        if (slideMenuTrigger !== null && slideMenu !== null) {

            slideMenuTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Replace 2nd-level dropdown items
                let slideMenuDialogs = slideMenu.querySelectorAll('.dialog-action');
                if (slideMenuDialogs.length) {
                    slideMenuDialogs.forEach((d) => {

                        // Get dialog ref
                        let ref = d.getAttribute('data-ref'),
                            body = document.querySelector(ref);

                        if (ref && body && body.childNodes[0]) {
                            slideMenu.innerHTML = slideMenu.innerHTML.replace(d.parentNode.outerHTML,
                                body.childNodes[0].innerHTML);
                        }
                    });
                }

                // Slide dialog
                const dlg = new Dialog(`<div class="container">${slideMenu.innerHTML}</div>`, {
                    dialogClassName: 'slide-menu-dialog',
                    dialogPlaceholderClassName: 'slide-menu-dialog-placeholder',
                    position: {
                        x: 0,
                        y: 0
                    },
                    callback: {
                        onShow: () => {
                            slideMenuTrigger.style.visibility = 'hidden';
                            document.body.classList.add('no-scroll');
                            document.querySelector('.logo').classList.add('logo-slide-menu');
                        },
                        onClose: () => {
                            slideMenuTrigger.style.visibility = 'visible';
                            document.body.classList.remove('no-scroll');
                            document.querySelector('.logo').classList.remove('logo-slide-menu');
                        }
                    }
                });

                // Attach event on slide close
                let slideMenuCloseButton = dlg.dlg.querySelector('button.btn-slide-close');
                if (slideMenuCloseButton) {
                    slideMenuCloseButton.addEventListener('click', (e) => {

                        // Prevent default
                        e.preventDefault();
                        e.stopPropagation();

                        // Close dialog
                        dlg.close();
                    });
                }
            });
        }
    }

    /**
     * Enable dialogs across the app.
     * @param selector Dialog selector
     * @param callback (Optional) Callback when opening dialog
     */
    function enableDialog(selector, callback = null) {

        // Get dialogs
        const dialogs = document.querySelectorAll(selector);
        if (dialogs.length) {
            dialogs.forEach((d) => {

                // Get dialog ref
                let ref = d.getAttribute('data-ref'),
                    body = document.querySelector(ref),
                    attr = d.getAttribute('data-attr');

                if (ref && body) {
                    d.addEventListener('click', (e) => {

                        // Prevent default
                        e.preventDefault();
                        e.stopPropagation();

                        // Close all previous dialogs
                        if (attr && attr.includes('closeAll')) {
                            Dialog.closeAll();
                        }

                        // Keep element selected
                        d.classList.add('selected');

                        // Create dialog
                        const dlg = new Dialog(body.innerHTML, {
                            dialogClassName: (attr && attr.includes('isDropdown') ? 'dialog-dropdown' : 'dialog-shadowed'),
                            dialogPlaceholderClassName: (attr && attr.includes('isDropdown') ? 'dialog-placeholder' : 'dialog-placeholder-shadowed'),
                            closeOnEsc: true,
                            closeOnOutsideClick: true,
                            linkTo: (attr && attr.includes('linkTo') ? d : null),
                            callback: {
                                onClose: () => {
                                    d.classList.remove('selected');
                                }
                            }
                        });

                        // Callback
                        if (callback) {
                            callback(dlg, d.dataset || null);
                        }

                        // Close button action (if exists)
                        const closeButton = dlg.dlg.querySelector('.close-dialog');
                        if (closeButton) {
                            closeButton.addEventListener('click', (e) => {

                                // Prevent default
                                e.preventDefault();
                                e.stopPropagation();

                                // Close dialog
                                dlg.close();
                            });
                        }
                    });
                }
            });
        }
    }

    return {

        // Slide menu
        slide: enableSlideMenu,

        // Dropdown
        dialog: enableDialog

    };

})();

/**
 * Initialize app.
 */
(() => {

    app.slide();
    app.dialog('.dialog-action');

})();