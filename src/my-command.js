import sketch from 'sketch'
let Settings = sketch.Settings

let breakModeOptionDefault = 0
let breakModeOptionTruncatingHead = 3
let breakModeOptionTruncatingMiddle = 5
let breakModeOptionTruncatingTail = 4

let didAttemptWithBadSelectionKey = 'com.truncat.didAttemptWithBadSelection'
// if a user attempts to apply truncat on an unacceptable selection more
// than once, then display a reminder message

export function resetSettings() {
    let document = sketch.getSelectedDocument()
    let selection = document.selectedLayers.layers

    sketch.UI.message("✨🐈 All Clean")
    truncate(selection, NSLineBreakByWordWrapping)
    setState([breakModeOptionDefault])
}

export function truncateHead() {
    let document = sketch.getSelectedDocument()
    let selection = document.selectedLayers.layers
    let textLayers = getTextLayersFromLayers(selection)

    if (!textLayers) {
        showWarningIfUserAttemptedWithBadSelection()
    } else {
        sketch.UI.message("...🐈 Truncate Head")
        truncate(selection, NSLineBreakByTruncatingHead)
        setState([breakModeOptionTruncatingHead])
        Settings.setGlobalSettingForKey(didAttemptWithBadSelectionKey, false)
    }

}

export function truncateMiddle() {
    let document = sketch.getSelectedDocument()
    let selection = document.selectedLayers.layers
    let textLayers = getTextLayersFromLayers(selection)

    if (!textLayers) {
        showWarningIfUserAttemptedWithBadSelection()
    }  else {
        sketch.UI.message("🐈...🐈 Truncate Belly")
        truncate(textLayers, NSLineBreakByTruncatingMiddle)
        setState([breakModeOptionTruncatingMiddle])
        Settings.setGlobalSettingForKey(didAttemptWithBadSelectionKey, false)
    }
}

export function truncateTail() {
    let document = sketch.getSelectedDocument()
    let selection = document.selectedLayers.layers
    let textLayers = getTextLayersFromLayers(selection)

    if (!textLayers) {
        showWarningIfUserAttemptedWithBadSelection()
    } else {
        sketch.UI.message("🐈... Truncate Tail")
        truncate(textLayers, NSLineBreakByTruncatingTail)
        setState([breakModeOptionTruncatingTail])
        Settings.setGlobalSettingForKey(didAttemptWithBadSelectionKey, false)
    }
}

function truncate(textLayers, lineBreakType) {
    if (textLayers) {
        textLayers.forEach(textLayer => {
            let paragraphStyle = textLayer.sketchObject.paragraphStyle()
            paragraphStyle.setLineBreakMode(lineBreakType)
            textLayer.sketchObject.addAttribute_value(NSParagraphStyleAttributeName, paragraphStyle)
        })
    }
}

export function selectionChanged() {
    let document = sketch.getSelectedDocument()
    let selectedLayers = document.selectedLayers.layers

    let textLayers = getTextLayersFromLayers(selectedLayers)
    if (textLayers) {
        updateUI(textLayers)
    } else {
        clearUI()
    }
}

function clearUI() {
    const menuItems = getMenuItems()
    const menuItemTruncateHead = menuItems[0]
    const menuItemTruncateBelly = menuItems[1]
    const menuItemTruncateTail = menuItems[2]

    menuItemTruncateHead.setState(NSControlStateValueOff)
    menuItemTruncateBelly.setState(NSControlStateValueOff)
    menuItemTruncateTail.setState(NSControlStateValueOff)
}

function getTextLayersFromLayers(layers) {
    if (layers == null) {
        // no layers
        return null
    } else {
        let textLayers = layers.filter(layer => layer.type == "Text")
        if (textLayers.length == 0) {
            // no text layers
            return null
        } else {
            return textLayers
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
    clearUI()

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
        // no more break mode options
        //console.log("Out of supported break mode options")
    }
}

function getMenuItems() {
    let menu = NSApplication.sharedApplication().mainMenu()
    let pluginsMenu = menu.itemWithTitle('Plugins').submenu()
    let truncatMenu = pluginsMenu.itemWithTitle('Truncat 🐈...').submenu()

    let menuItemTruncateHead = truncatMenu.itemWithTitle('Truncate Head')
    let menuItemTruncateBelly = truncatMenu.itemWithTitle('Truncate Belly')
    let menuItemTruncateTail = truncatMenu.itemWithTitle('Truncate Tail')

    return [menuItemTruncateHead, menuItemTruncateBelly, menuItemTruncateTail]
}

function showWarningIfUserAttemptedWithBadSelection() {
    let didAttemptWithBadSelection = Settings.globalSettingForKey(didAttemptWithBadSelectionKey)
    if (didAttemptWithBadSelection) {
        sketch.UI.message("🐈... Please select a text layer")
    } else {
        Settings.setGlobalSettingForKey(didAttemptWithBadSelectionKey, true)
    }
}
