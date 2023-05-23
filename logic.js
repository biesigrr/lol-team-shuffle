var roles = ['top', 'jgl', 'mid', 'adc', 'sup']

window.onload = function() {
    var container = document.getElementById("content-container")
    for (var i = 1; i <= 5; i++) {
        container.insertBefore(create_player_row(i), container.childNodes[i])
    }

    restore_values()
}

function create_element(tag) {
    var element = document.createElement(tag)
    for (var i = 1; i < arguments.length; i++) {
        element.classList.add(arguments[i])
    }

    return element
}

function create_role_checkbox(index, role) {
    // <div class="col col-sm-auto p-0 role-checkbox">
    //     <input type="checkbox" id="top1" checked />
    //     <label for="top1">
    //         <img src="img/top.png" alt="top" />
    //     </label>
    // </div>
    var role_checkbox = create_element("div", "col", "col-sm-auto", "p-0", "role-checkbox")

    var input = create_element("input")
    input.type = "checkbox"
    input.id = role + index
    input.checked = true

    var img = create_element("img")
    img.src = "img/" + role + ".png"
    img.alt = role

    var label = create_element("label")
    label.id = "label" + role + index
    label.htmlFor = role + index
    label.appendChild(img)

    role_checkbox.appendChild(input)
    role_checkbox.appendChild(label)

    return role_checkbox
}

function create_player_row(index) {
    // <div class="row">
    //     <div class="col"> </div>
    //     <div class="col-sm-auto d-flex">
    //         <input id="name1" class="form-control m-auto" type="text" value="Player1" />
    //     </div>
    //     <div class="col-md-auto">
    //         <div class="row" id="row1">
    //         </div>
    //     </div>
    //     <div class="col-md-auto">
    //         <img src="img/arrow.svg" width="50px" />
    //         <img id="role1" src="img/mid.png" style="filter: grayscale(100);" />
    //     </div>
    //     <div class="col"> </div>
    // </div>

    var row = create_element("row", "row")

    var name_input = create_element("input", "form-control", "m-auto")
    name_input.id = "name" + index
    name_input.type = "text"
    name_input.defaultValue = "Player" + index

    var name_input_div = create_element("div", "col-sm-auto", "d-flex")
    name_input_div.appendChild(name_input)

    var roles_row = create_element("div", "row")
    for (var i = 0; i < 5; i++) {
        roles_row.appendChild(create_role_checkbox(index, roles[i]))
    }

    var roles_col = create_element("div", "col-md-auto")
    roles_col.appendChild(roles_row)

    var arrow_img = create_element("img")
    arrow_img.src = "img/arrow.svg"
    arrow_img.style.width = "50px"

    var role_img = create_element("img")
    role_img.id = "role" + index
    role_img.src = "img/mid.png"
    role_img.style.filter = "grayscale(100)"

    var role_col = create_element("div", "col-md-auto")
    role_col.appendChild(arrow_img)
    role_col.appendChild(role_img)

    row.appendChild(create_element("div", "col"))
    row.appendChild(name_input_div)
    row.appendChild(roles_col)
    row.appendChild(role_col)
    row.appendChild(create_element("div", "col"))

    return row
}

function create_percentage_display(percentage) {
    var div = create_element("div", "text-light", "percentage-display")
    div.innerText = percentage + "%"
    return div
}

function remove_percentage_display() {
    var elements = document.getElementsByClassName("percentage-display")
    for (var i = elements.length - 1; i >= 0; i--) {
        var element = elements[i]
        element.parentNode.removeChild(element)
    }
}

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

function shuffle_roles(options) {
    var matches = false
    var bias = [0, 1, 2, 3, 4]
    do {
        shuffle(bias)
        var matches = bias.map((e, i) => options[i][e]).every(Boolean)
    } while (!matches)

    return bias
}

function brute_force(options) {
    var selections = shuffle_roles(options)
    for (var i = 0; i < selections.length; i++) {
        set_role(selections[i], i + 1)
    }
}

function get_player_choice(id) {
    var player_choice = [false, false, false, false, false]
    for (var i = 0; i < 5; i++) {
        player_choice[i] = document.getElementById(roles[i] + id).checked
    }

    return player_choice
}

function set_player_choice(id, choice) {
    for (var i = 0; i < 5; i++) {
        document.getElementById(roles[i] + id).checked = choice[i]
    }
}

function get_player_choices() {
    var player_choices = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false]
    ]

    for (var i = 1; i <= 5; i++) {
        player_choices[i - 1] = get_player_choice(i)
    }

    return player_choices
}

function assign_roles() {
    var player_choices = get_player_choices()
    brute_force(player_choices)
    if (should_save_cookie()) {
        save_values()
    }
}

var today = new Date()
var expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000)

function should_save_cookie() {
    return document.getElementById('save_values_check').checked
}

function set_cookie(value) {
    document.cookie = "data=" + escape(value) + "; path=/; expires=" + expiry.toGMTString() + "; samesite=strict"
}

function has_cookie() {
    return document.cookie.split(';').some(c => c.trim().startsWith('data='))
}

function get_cookie() {
    var re = new RegExp("data=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}

function delete_cookie() {
    if (has_cookie()) {
        document.cookie = "data=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=strict"
    }

    reset_values()
}

function save_values() {
    var data = new Object()
    for (var i = 1; i <= 5; i++) {
        data["name" + i] = document.getElementById("name" + i).value
        data["choice" + i] = get_player_choice(i)
    }

    set_cookie(JSON.stringify(data))
}

function restore_values() {
    var data = get_cookie()
    if (!data) {
        return
    }

    document.getElementById('save_values_check').checked = true

    data = JSON.parse(data)
    for (var i = 1; i <= 5; i++) {
        document.getElementById("name" + 1).value = data["name" + 1]
        set_player_choice(i, data["choice" + i])
    }
}

function reset_field(field) {
    field.value = field.defaultValue
}

function reset_values() {
    for (var i = 1; i <= 5; i++) {
        reset_field(document.getElementById("name" + i))
        set_player_choice(i, [true, true, true, true, true])

        var role_img = document.getElementById('role' + i)
        role_img.src = 'img/mid.png'
        role_img.style.filter = 'grayscale(100)'
    }

    document.getElementById('save_values_check').checked = false
}