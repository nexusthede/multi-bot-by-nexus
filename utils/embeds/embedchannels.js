function lock(channel) {
  return {
    description: `#${channel} has been locked`
  };
}

function unlock(channel) {
  return {
    description: `#${channel} has been unlocked`
  };
}

function hide(channel) {
  return {
    description: `#${channel} is now hidden`
  };
}

function unhide(channel) {
  return {
    description: `#${channel} is now visible`
  };
}

// ❌ FAIL EMBED
function fail(reason) {
  return {
    description: `FAILED\n• Reason\n> ${reason}`
  };
}

// ⚖ PERMISSION EMBED
function permission() {
  return {
    description: `ACCESS DENIED\n• Status\n> Missing permissions`
  };
}

// ✅ SUCCESS EMBED (generic fallback if needed)
function success(action) {
  return {
    description: `SUCCESS\n• Action\n> ${action}`
  };
}

module.exports = {
  lock,
  unlock,
  hide,
  unhide,
  fail,
  permission,
  success
};
