import sketch from 'sketch'
// documentation: https://developer.sketchapp.com/reference/api/
let breakModeOptionDefault = 0
let breakModeOptionTruncatingHead = 3
let breakModeOptionTruncatingMiddle = 5
let breakModeOptionTruncatingTail = 4

export function resetSettings() {
    sketch.UI.message("✨🐈 All Clean")

    let document = sketch.getSelectedDocument()
    let selection = document.selectedLayers.layers
    truncate(selection, NSLineBreakByWordWrapping)

    setState([breakModeOptionDefault])
}

export function truncateHead() {
    sketch.UI.message("...🐈 Truncate Head")

    let document = sketch.getSelectedDocument()
    let selection = document.selectedLayers.layers
    truncate(selection, NSLineBreakByTruncatingHead)

    setState([breakModeOptionTruncatingHead])
}

export function truncateMiddle() {
    sketch.UI.message("🐈...🐈 Truncate Belly")

    let document = sketch.getSelectedDocument()
    let selection = document.selectedLayers.layers
    truncate(selection, NSLineBreakByTruncatingMiddle)

    setState([breakModeOptionTruncatingMiddle])
}

export function truncateTail() {
    sketch.UI.message("🐈... Truncate Tail")

    let document = sketch.getSelectedDocument()
    let selection = document.selectedLayers.layers
    truncate(selection, NSLineBreakByTruncatingTail)

    setState([breakModeOptionTruncatingTail])
}

function truncate(selectedLayers, lineBreakType) {
    if (selectedLayers == null) {
        // no layers selected
    } else {
        var textLayers = selectedLayers.filter(layer => layer.type == "Text")
        if (textLayers.length == 0) {
            // no text layers selected
        } else {
            textLayers.forEach(textLayer => {
                let paragraphStyle = textLayer.sketchObject.paragraphStyle()
                console.log("before", paragraphStyle)
                paragraphStyle.setLineBreakMode(lineBreakType)
                textLayer.sketchObject.addAttribute_value(NSParagraphStyleAttributeName, paragraphStyle)
                console.log("after", textLayer.sketchObject.paragraphStyle())
            })
        }
    }
}

export function selectionChanged() {
    let document = sketch.getSelectedDocument()
    let selectedLayers = document.selectedLayers.layers

    if (selectedLayers == null) {
        // no layers selected
    } else {
        var textLayers = selectedLayers.filter(layer => layer.type == "Text")
        if (textLayers.length == 0) {
            // no text layers selected
        } else {
            updateUI(textLayers)
        }
    }
}

function updateUI(textLayers) {
    let selectionSettings = []
    textLayers.forEach(textLayer => {
        let lineBreakMode = textLayer.sketchObject.paragraphStyle().lineBreakMode()
        selectionSettings.push(lineBreakMode)
    })

    let filteredSelectionSettings = selectionSettings.filter((item,index) => selectionSettings.indexOf(item) === index)

    //check to see if there is a mixed state
    if (filteredSelectionSettings.length > 1) {
        setupMixedState(filteredSelectionSettings)
    } else {
        setState(filteredSelectionSettings[0])
    }
}

function setupMixedState(filteredSelectionSettings) {
    const menuItems = getMenuItems()
    const menuItemTruncateHead = menuItems[0]
    const menuItemTruncateBelly = menuItems[1]
    const menuItemTruncateTail = menuItems[2]

    //clear settings before setup
    menuItemTruncateHead.setState(NSControlStateValueOff)
    menuItemTruncateBelly.setState(NSControlStateValueOff)
    menuItemTruncateTail.setState(NSControlStateValueOff)

    filteredSelectionSettings.forEach(setting => {
        if (setting == 0) {
            // just the default breakModeOption
        } else if (setting == 3) {
            // truncating head
            menuItemTruncateHead.setState(NSControlStateValueMixed)
        } else if (setting == 5) {
            // truncating middle
            menuItemTruncateBelly.setState(NSControlStateValueMixed)
        } else if (setting == 4) {
            // truncating tail
            menuItemTruncateTail.setState(NSControlStateValueMixed)
        } else {
            console.log("Out of supported break mode options")
        }
    })
}

function setState(setting) {
    const menuItems = getMenuItems()
    const menuItemTruncateHead = menuItems[0]
    const menuItemTruncateBelly = menuItems[1]
    const menuItemTruncateTail = menuItems[2]

    //clear settings before setup
    menuItemTruncateHead.setState(NSControlStateValueOff)
    menuItemTruncateBelly.setState(NSControlStateValueOff)
    menuItemTruncateTail.setState(NSControlStateValueOff)

    if (setting == 0) {
        // just the default breakModeOption
    } else if (setting == 3) {
        // truncating head
        menuItemTruncateHead.setState(NSControlStateValueOn)
    } else if (setting == 5) {
        // truncating middle
        menuItemTruncateBelly.setState(NSControlStateValueOn)
    } else if (setting == 4) {
        // truncating tail
        menuItemTruncateTail.setState(NSControlStateValueOn)
    } else {
        console.log("Out of supported break mode options")
    }
}

function getMenuItems() {
    let menu = NSApplication.sharedApplication().mainMenu()
    let pluginsMenu = menu.itemWithTitle('Plugins').submenu()
    let truncatMenu = pluginsMenu.itemWithTitle('Truncat 🐈...').submenu()  // convert to try/catch

    let menuItemTruncateHead = truncatMenu.itemWithTitle('Truncate Head')
    let menuItemTruncateBelly = truncatMenu.itemWithTitle('Truncate Belly')
    let menuItemTruncateTail = truncatMenu.itemWithTitle('Truncate Tail')

    return [menuItemTruncateHead, menuItemTruncateBelly, menuItemTruncateTail]
}
