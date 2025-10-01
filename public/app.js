let map;
let currentMarker;
let allMarkers = [];

function initMap() {
    const defaultCenter = { lat: 40.0, lng: 0.0 };

    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultCenter,
        zoom: 2,
        styles: [
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
            }
        ]
    });

    map.addListener('click', function(event) {
        placeMarker(event.latLng);
    });

    loadParticipants();
}

function placeMarker(location) {
    if (currentMarker) {
        currentMarker.setMap(null);
    }

    currentMarker = new google.maps.Marker({
        position: location,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
    });

    document.getElementById('lat').value = location.lat();
    document.getElementById('lng').value = location.lng();

    currentMarker.addListener('dragend', function(event) {
        document.getElementById('lat').value = event.latLng.lat();
        document.getElementById('lng').value = event.latLng.lng();
    });
}

document.getElementById('geocode-btn').addEventListener('click', async function() {
    const address = document.getElementById('location').value;

    if (!address) {
        showStatus('Please enter a location first', 'error');
        return;
    }

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK') {
            const location = results[0].geometry.location;
            map.setCenter(location);
            map.setZoom(12);
            placeMarker(location);

            document.getElementById('location').value = results[0].formatted_address;
            showStatus('Location found on map!', 'success');
        } else {
            showStatus('Could not find location on map: ' + status, 'error');
        }
    });
});

document.getElementById('registration-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        location: document.getElementById('location').value,
        lat: document.getElementById('lat').value,
        lng: document.getElementById('lng').value,
        interests: document.getElementById('interests').value,
        lifeGoals: document.getElementById('life-goals').value,
        message: document.getElementById('message').value,
        discord: document.getElementById('discord').value,
        telegram: document.getElementById('telegram').value,
        vk: document.getElementById('vk').value,
        otherSocial: document.getElementById('other-social').value
    };

    if (!formData.lat || !formData.lng) {
        showStatus('Please select your location on the map', 'error');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showStatus('Registration successful! You have been added to the community map.', 'success');
            document.getElementById('registration-form').reset();
            document.getElementById('lat').value = '';
            document.getElementById('lng').value = '';

            if (currentMarker) {
                currentMarker.setMap(null);
                currentMarker = null;
            }

            setTimeout(() => {
                loadParticipants();
            }, 1000);
        } else {
            showStatus('Registration failed: ' + (result.message || result.error), 'error');
        }
    } catch (error) {
        showStatus('Error submitting registration: ' + error.message, 'error');
    }
});

document.getElementById('load-participants').addEventListener('click', loadParticipants);

async function loadParticipants() {
    try {
        const response = await fetch('/api/participants');

        if (!response.ok) {
            throw new Error('Failed to load participants');
        }

        const participants = await response.json();

        allMarkers.forEach(marker => marker.setMap(null));
        allMarkers = [];

        participants.forEach(participant => {
            if (participant.lat && participant.lng) {
                const marker = new google.maps.Marker({
                    position: { lat: participant.lat, lng: participant.lng },
                    map: map,
                    title: participant.name,
                    icon: {
                        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    }
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: createInfoWindowContent(participant)
                });

                marker.addListener('click', function() {
                    infoWindow.open(map, marker);
                });

                allMarkers.push(marker);
            }
        });

        if (participants.length > 0) {
            showStatus(`Loaded ${participants.length} participants`, 'success');
        } else {
            showStatus('No participants found yet. Be the first to join!', 'success');
        }
    } catch (error) {
        showStatus('Error loading participants: ' + error.message, 'error');
    }
}

function createInfoWindowContent(participant) {
    let content = `<div class="marker-info">`;
    content += `<h3>${participant.name}</h3>`;
    content += `<p class="location">${participant.location}</p>`;

    if (participant.interests) {
        content += `<div class="interests"><strong>Skills & Profession:</strong> ${participant.interests}</div>`;
    }

    if (participant.lifeGoals) {
        content += `<div class="life-goals"><strong>Life Goals:</strong> ${participant.lifeGoals}</div>`;
    }

    if (participant.message) {
        content += `<div class="message"><strong>Message:</strong> ${participant.message}</div>`;
    }

    // Social media contacts
    const socials = [];
    if (participant.discord) socials.push(`Discord: ${participant.discord}`);
    if (participant.telegram) socials.push(`Telegram: ${participant.telegram}`);
    if (participant.vk) socials.push(`VK: ${participant.vk}`);
    if (participant.otherSocial) socials.push(`Other: ${participant.otherSocial}`);

    if (socials.length > 0) {
        content += `<div class="socials"><strong>Contacts:</strong><br>${socials.join('<br>')}</div>`;
    }

    content += `</div>`;
    return content;
}

function showStatus(message, type) {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type} show`;

    setTimeout(() => {
        statusElement.classList.remove('show');
    }, 5000);
}

window.onload = function() {
    if (typeof google !== 'undefined' && google.maps) {
        initMap();
    } else {
        console.error('Google Maps API not loaded. Please check your API key.');
        showStatus('Google Maps API not loaded. Please configure API key.', 'error');
    }
};