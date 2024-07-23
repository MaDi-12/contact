document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    const addContactBtn = document.getElementById('addContactBtn');
    const searchInput = document.getElementById('searchInput');
    const contactForm = document.getElementById('contactForm');
    const contactFormContent = document.getElementById('contactFormContent');
    const cancelBtn = document.getElementById('cancelBtn');
    const contactList = document.getElementById('contactList');
    const contactDetailModal = document.getElementById('contactDetailModal');
    const contactDetails = document.getElementById('contactDetails');
    const closeBtn = document.querySelector('.close');

    addContactBtn.addEventListener('click', () => {
        clearForm();
        contactForm.style.display = 'flex';
    });

    cancelBtn.addEventListener('click', () => {
        contactForm.style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
        contactDetailModal.style.display = 'none';
    });

    contactFormContent.addEventListener('submit', function(event) {
        event.preventDefault();
        const contact = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            email: document.getElementById('email').value,
            birthday: document.getElementById('birthday').value,
            photo: document.getElementById('photo').files[0]
        };
        saveContact(contact);
        contactForm.style.display = 'none';
    });

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        filterContacts(query);
    });

    function saveContact(contact) {
        const newContact = navigator.contacts.create({
            displayName: `${contact.firstName} ${contact.lastName}`,
            name: {
                givenName: contact.firstName,
                familyName: contact.lastName
            },
            phoneNumbers: [{
                type: 'mobile',
                value: contact.phoneNumber,
                pref: true
            }],
            emails: [{
                type: 'home',
                value: contact.email
            }],
            photos: contact.photo ? [{
                type: 'base64',
                value: contact.photo
            }] : [],
            birthday: contact.birthday ? new Date(contact.birthday) : null
        });

        newContact.save(onSaveSuccess, onSaveError);

        function onSaveSuccess(contact) {
            displayContacts();
        }

        function onSaveError(contactError) {
            alert('Error saving contact: ' + contactError.code);
        }
    }

    function filterContacts(query) {
        const items = contactList.getElementsByTagName('li');
        Array.from(items).forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
        });
    }

    function deleteContact(contact) {
        contact.remove(function() {
            displayContacts();
        }, function(error) {
            alert('Error deleting contact: ' + error.code);
        });
    }

    function editContact(contact) {
        document.getElementById('firstName').value = contact.name.givenName;
        document.getElementById('lastName').value = contact.name.familyName;
        document.getElementById('phoneNumber').value = contact.phoneNumbers[0].value;
        document.getElementById('email').value = contact.emails[0].value;
        document.getElementById('birthday').value = contact.birthday ? new Date(contact.birthday).toISOString().substr(0, 10) : '';
        contactForm.style.display = 'flex';

        contactFormContent.onsubmit = function(event) {
            event.preventDefault();
            contact.name.givenName = document.getElementById('firstName').value;
            contact.name.familyName = document.getElementById('lastName').value;
            contact.phoneNumbers[0].value = document.getElementById('phoneNumber').value;
            contact.emails[0].value = document.getElementById('email').value;
            contact.birthday = document.getElementById('birthday').value ? new Date(document.getElementById('birthday').value) : null;
            contact.photos = document.getElementById('photo').files[0] ? [{
                type: 'base64',
                value: document.getElementById('photo').files[0]
            }] : contact.photos;
            contact.save(onSaveSuccess, onSaveError);
            contactForm.style.display = 'none';
        }
    }

    function clearForm() {
        contactFormContent.reset();
        contactFormContent.onsubmit = function(event) {
            event.preventDefault();
            const contact = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                email: document.getElementById('email').value,
                birthday: document.getElementById('birthday').value,
                photo: document.getElementById('photo').files[0]
            };
            saveContact(contact);
            contactForm.style.display = 'none';
        };
    }

    function displayContacts() {
        navigator.contacts.find(['*'], function(contacts) {
            contactList.innerHTML = '';
            contacts.forEach(contact => {
                const li = document.createElement('li');
                const now = new Date();
                const birthday = contact.birthday ? new Date(contact.birthday) : null;
                const isBirthday = birthday && now.getMonth() === birthday.getMonth() && now.getDate() === birthday.getDate();
                li.innerHTML = `
                    <div class="content">
                        <span>${contact.displayName || ''}</span>
                        <span>${isBirthday ? '<i class="gift-icon">🎁</i>' : ''}</span>
                    </div>
                    <div class="actions">
                        <button class="deleteBtn">Delete</button>
                        <button class="editBtn">Edit</button>
                    </div>
                `;
                li.querySelector('.deleteBtn').addEventListener('click', function() {
                    if (confirm('Are you sure you want to delete this contact?')) {
                        deleteContact(contact);
                    }
                });
                li.querySelector('.editBtn').addEventListener('click', function() {
                    editContact(contact);
                });
                li.querySelector('.content').addEventListener('click', function() {
                    showContactDetails(contact);
                });

                setupSwipeActions(li);
                contactList.appendChild(li);
            });
        }, function(error) {
            alert('Error fetching contacts: ' + error.code);
        }, {multiple: true});
    }

    function showContactDetails(contact) {
        const detailsHTML = `
            <p><strong>Name:</strong> ${contact.displayName || ''}</p>
            <p><strong>Phone Number:</strong> ${contact.phoneNumbers && contact.phoneNumbers[0] ? contact.phoneNumbers[0].value : ''}</p>
            <p><strong>Email:</strong> ${contact.emails && contact.emails[0] ? contact.emails[0].value : ''}</p>
            <p><strong>Birthday:</strong> ${contact.birthday ? new Date(contact.birthday).toDateString() : ''}</p>
            ${contact.photos && contact.photos[0] ? `<img src="${contact.photos[0].value}" alt="Contact Photo" style="width: 100px; height: 100px; border-radius: 50%;">` : ''}
        `;
        contactDetails.innerHTML = detailsHTML;
        contactDetailModal.style.display = 'flex';
    }

    function setupSwipeActions(item) {
        let startX;
        item.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });

        item.addEventListener('touchmove', function(e) {
            const touch = e.touches[0];
            const change = startX - touch.clientX;
            if (change > 0) {
                item.style.transform = `translateX(-${change}px)`;
            }
        });

        item.addEventListener('touchend', function(e) {
            const change = startX - e.changedTouches[0].clientX;
            if (change > 100) {
                item.querySelector('.actions').style.transform = 'translateX(0)';
            } else {
                item.style.transform = 'translateX(0)';
            }
        });
    }

    displayContacts();
}
