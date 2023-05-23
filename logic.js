var roles = ['top', 'jgl', 'mid', 'adc', 'sup']

function set_role(role_index, player_number) {
    var td = document.getElementById('td' + player_number)
    var role_img = document.getElementById('role' + player_number)

    role_img.src = 'img/' + roles[role_index] + '.png'
    role_img.style.filter = 'grayscale(0)'
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function brute_force(options) {
    var matches = false
    var bias = [0, 1, 2, 3, 4]
    do {
        shuffle(bias)
        var matches = bias.map((e, i) => options[i][e]).every(Boolean)
    } while (!matches)

    for (var i = 0; i < bias.length; i++) {
        set_role(bias[i], i + 1)
    }
}

function assign_roles() {
    var player_choices = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false]
    ]

    for (var i = 1; i <= 5; i++) {
        var player_choice = player_choices[i - 1]
        player_choice[0] = document.getElementById('top' + i).checked
        player_choice[1] = document.getElementById('jgl' + i).checked
        player_choice[2] = document.getElementById('mid' + i).checked
        player_choice[3] = document.getElementById('adc' + i).checked
        player_choice[4] = document.getElementById('sup' + i).checked
    }

    brute_force(player_choices)
}