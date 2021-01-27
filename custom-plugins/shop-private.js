"use strict";

/*********************************************
 * Interactive multi-shop interface by Astofolo *
 *********************************************/

/************
 * Shop help *
 *************
 *  This interactive shop is designed to be used with multiple shops; hence the menus and sub menus;
 *  if your server doesn't use multiple shops; this isn't for you.
 *
 *  If you want to add/remove items and shop menus, you'll need to edit shopData.json. A list of
 *  properties and what they do is listed below. If you are adding a shop item, you'll also
 *  need to add a case for it into the redeem command. Adding menus, obviously, requires no such effort.
 *
 **************
 * Properties *
 **************
 *
 * closed - can be included as a property of shopData; if this is true, the shop and redeem commands will be rendered unusable.
 *
 * display - The name that will be displayed in the shop for this item/menu
 *
 * info - this can be set to a string of text that will be added into the info-bar marquee at the bottom of the shop. typically used to provide info about the item or menu the user is on
 *
 * items - a property for menus that allows you to add shop items or more sub-menus for navigation. sub menus and shop items should not be contained in the same object
 *
 * price - the value that is required to be paid in the set currency when this item is redeemed. should be an integer value.
 *
 * currency - the type of currency required. this is used for the shop UI as well as the redeem command
 *
 * img - a property for shop items that allows you to specify an example image of what the user is buying.
 *
 * multibuy - a property for shop items that can be bought multiple times in succession.
 *
 * onbuy - a property for shop items that displays on-purchase instructions
 *
 ************/

const fs = require("fs");
const size = require("request-image-size");

Server.itemList = [];
Server.currencies = [];

function loadShops() {
  try {
    Server.shopData = JSON.parse(
      fs.readFileSync("config/shopData.json", "utf8")
    );
  } catch (e) {
    Server.shopData = {
      closed: true
    };
  }
  if (!Server.shopData.closed) buildShop(Server.shopData);
}
setTimeout(function() {
  loadShops();
}, 2000);

function buildShop(shopData) {
  let properties = Object.getOwnPropertyNames(shopData);
  let arr = [];
  for (let i in properties) {
    let name = properties[i];
    arr.push(shopData[name].items);
  }
  for (let i = 0; i < arr.length; i++) {
    getItems(arr[i], properties[i]);
  }
}

function getItems(obj, objname) {
  let properties = Object.getOwnPropertyNames(obj);
  for (let i in properties) {
    let name = properties[i];
    if (obj[name].items) {
      getItems(obj[name].items, name);
    } else {
      let shopItem = {
        name: name,
        display: obj[name].display,
        price: obj[name].price,
        multibuy: obj[name].multibuy,
        currency: obj[name].currency,
        onbuy: obj[name].onbuy
      };
      Server.itemList.push(shopItem);
      if (Server.currencies.indexOf(shopItem.currency) === -1)
        Server.currencies.push(shopItem.currency);
    }
  }
}

function drawMain(output) {
  let shopData = Server.shopData;
  output += "<div><center><table border=0>";
  let arr = Object.getOwnPropertyNames(shopData);
  let outputArr = [];
  for (let x in arr) {
    let item = arr[x];
    outputArr.push(shopData[item]);
  }
  for (let x = 0; x < outputArr.length; x++) {
    let name = outputArr[x].display;
    output +=
      '<td style="padding: 8px;"><button style="border: 2px solid #000 ; border-radius: 15px 0px ; background: red; color: white;" name="send" value="/shop ' +
      arr[x] +
      '|1">' +
      name +
      "</button></td>";
    if ((x === 2 || x === 5 || x === 8) && x != +outputArr.length - +1)
      output += "</table><br/><table border=0>";
  }
  output += "</table></center><br/></div>";
  return output;
}

function assembleOutput(
  output,
  marquee,
  shop,
  selectionType,
  back,
  update,
  user,
  room,
  cache
) {
  output += "<br/><div>";
  output +=
    '<div style="padding: 5px; border: 2px solid #000; background: red; color: #fff; text-shadow: none; border-radius: 6px; margin: 10px"><div style="float: left; background-color: red; position: absolute; z-index: 10;">' +
    (selectionType !== "main" && selectionType !== "exit"
      ? '<button style="border: 2px solid #000; border-radius: 6px; background: red; color: white;" name="send" value="/shop main|1">Main Menu</button> <button style="border: 2px solid #000; border-radius: 6px; background: red; color: white;" name="send" value="/shop ' +
        back +
        '|1">Back</button> '
      : "") +
    '<button style="border: 2px solid #000; border-radius: 6px; background: red; color: white;" name="send" value="/shop exit|1">Exit</button></div><marquee style="text-align: center; width: 100%" direction="left">' +
    marquee +
    "</marquee></div>";
  shop =
    '<div style="padding: 5px; border: 2px solid #101ad1; background: red; color: #fff; text-shadow: none; border-radius: 6px; margin: 10px"><center><font size=4><i><b>' +
    serverName +
    " Server Shop</b></i></font></center></div><br/><br/>" +
    output;
  if (selectionType == "exit")
    shop =
      '<center>Shop closed - click <button style="border: 2px solid #000; border-radius: 15px 0px ; background: $6600CC; color: white;" name="send" value="/shop main|1">here</button> to reopen the shop.</center>';
  if (cache) user.shopCache = shop;
  display(update, user, room, shop);
}

function display(update, user, room, output) {
  let uhtml = update
    ? "|uhtmlchange|" + user.userid + "shop|"
    : "|uhtml|" + user.userid + "shop|";
  Users.get(user.userid).connections[0].sendTo(room.id, uhtml + output);
}

function runTransaction(money, item, user) {
  if (money < item.price) return false;
  Economy.writeMoney(user.userid, item.price * -1);
  let receiptId = genReceiptId();
  let remaining = +money - +item.price;
  let receipt =
    user.userid +
    "|" +
    new Date().toUTCString() +
    "|" +
    item.display +
    "|" +
    item.price +
    "|" +
    item.currency +
    "|" +
    receiptId +
    "|" +
    remaining +
    "|0";
  logReceipt(receipt);
  return receipt;
}

function logReceipt(receipt) {
  fs.appendFile("logs/transactions.log", receipt + "\n", () => {});
}

function failedTransaction(user, item, money, room) {
  if (!user.shopCache) return false;
  let cache = user.shopCache;
  if (cache == "") return false;
  let parts = cache.split("<!-- split -->");
  let remaining = +item.price - +money;
  let output =
    parts[0] +
    "<br/><br/><center><b>You do not have enough " +
    item.currency +
    "<br/>" +
    remaining +
    " more " +
    item.currency +
    " requied.</b></center>" +
    parts[2];

  Users.get(user.userid).connections[0].sendTo(
    room.id,
    "|uhtmlchange|" + user.userid + "shop|" + output
  );
}

function successfulTransaction(item, receipt, user, room) {
  receipt = receipt.split("|");
  let output =
    '<div style="padding: 5px; border: 2px solid #000; background: red; color: #fff; text-shadow: none; border-radius: 6px; margin: 10px; text-align: center"><font size=4><i><b>' +
    serverName +
    " Server Shop</b></i></font></div><br/><br/>";
  output +=
    "<center><b>Your purchase was successful</b><br/><br/>" +
    item.onbuy +
    '<br/></center><div style="width: 70%;margin: 0 auto;"><b>Name: </b>' +
    user.name +
    "<br/><b>Date: </b>" +
    receipt[1] +
    "<br/><b>Item: </b>" +
    receipt[2] +
    "<br/><b>Price: </b>" +
    receipt[3] +
    " " +
    receipt[4] +
    "<br/><b>Remaining " +
    receipt[4] +
    ": </b>" +
    receipt[6] +
    "<br/><b>ReceiptID: </b>" +
    receipt[5] +
    "<br/><br/><center>This receipt is stored as your proof of purchase in the event of an error.<br/>Use /receipts to see your recent receipts.<br/><br/>";
  output +=
    '<button style="border: 2px solid #000; border-radius: 6px; background: red; color: white;" name="send" value="/shop main|1">Main Menu</button> ' +
    (item.multibuy && receipt[3] < receipt[4]
      ? '<button style="border: 2px solid #070e96 ; border-radius: 6px; background: black ; color: white;" name="send" value="/rebuy ' +
        item.name +
        '">Buy Another</button>'
      : "");
  output +=
    '<br/></center></div><div style="padding: 5px; border: 2px solid #101ad1; background: red; color: #fff; text-shadow: none; border-radius: 6px; margin: 10px"><div style="float: left;"><button style="border: 2px solid #000; border-radius: 6px; background: red; color: white;" name="send" value="/shop main|1">Main Menu</button> <button style="border: 2px solid #000; border-radius: 6px; background: red; color: white;" name="send" value="/shop exit|1">Exit</button></div><marquee style="text-align: center; width: 70%" direction="left">Thank you for your purchase!</marquee></div>';

  Users.get(user.userid).connections[0].sendTo(
    room.id,
    "|uhtmlchange|" + user.userid + "shop|" + output
  );
}

function genReceiptId() {
  let receipt;
  let lines = fs
    .readFileSync("logs/transactions.log", "utf8")
    .split("\n")
    .reverse();
  let existing = [];
  for (let i in lines) {
    let parts = lines[i].split(",");
    existing.push(lines[5]);
  }
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  do {
    receipt = "";
    for (let i = 0; i < 8; i++) {
      receipt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  } while (existing.indexOf(receipt) !== -1);
  return receipt;
}

//add different currencies as args
function setupPrice(item, stardust) {
  if (item.currency === "bucks") return stardust;
  //set up different cases here for different currencies
}

function scaleImage(url, callback) {
  if (url) {
    size(url, function(err, dimensions, length) {
      let width = dimensions.width;
      let height = dimensions.height;
      if (height >= 120) {
        let scaleFactor = +height / +120;
        height = +height / +scaleFactor;
        width = +width / +scaleFactor;
      }
      let arr = [url, width, height];
      return callback(arr);
    });
  } else {
    return callback(false);
  }
}

exports.commands = {
  shop: function(target, room, user) {
    let shopData = Server.shopData;
    if (shopData.closed)
      return this.sendReply("The shop is currently closed; check back later.");
    if (room.battle)
      return this.errorReply("The shop isn't meant to be used in battles.");
    let shop;
    let output = "";
    let update = false;
    let selectionType = false;
    let selection = false;
    let isUpdate;
    let marquee =
      "Welcome to the " +
      serverName +
      " Server Shop! News: We added masterball!";
    if (target) {
      if (target.trim() === "help") {
        return this.sendReplyBox(
          "/shop - opens shop UI<br/>/receipts - lists your recent receipts<br/>/receipt [receipt ID] - displays the details of the specified receipt if you are the owner<br/>/receipts view, [user] - lists receipts of the specified user (requires @)<br/>Multi-Shop overhaul by Lights"
        );
      } else if (target.trim() === "credit" || target.trim() === "credits") {
        return this.sendReply("Multi-Shop overhaul by Lights");
      }
      target = target.split("|");
      if (target.length !== 2) {
        return this.parse("/shop");
      } else {
        selection = target[0].trim();
        isUpdate = target[1].trim();
        if (isUpdate === "1" || isUpdate === "2") update = true;
      }
      if (update) {
        let parts = false;
        if (selection.includes(".")) {
          parts = selection.split(".");
        }
        if (!parts) {
          if (selection == "main") {
            output = drawMain(output);
            selectionType = "main";
            assembleOutput(
              output,
              marquee,
              shop,
              selectionType,
              false,
              update,
              user,
              room,
              false
            );
          } else if (selection == "exit") {
            selectionType = "exit";
            assembleOutput(
              output,
              marquee,
              shop,
              selectionType,
              false,
              update,
              user,
              room,
              false
            );
          } else {
            let arr = Object.getOwnPropertyNames(shopData);
            let match = false;
            for (let x in arr) {
              if (selection == arr[x]) match = arr[x];
            }
            if (match) {
              selection = shopData[match].items;
              arr = Object.getOwnPropertyNames(selection);
              let test = arr[0];
              selectionType = selection[test].items ? "1" : "2";
              let outputArr = [];
              for (let y in arr) {
                let item = arr[y];
                outputArr.push(selection[item]);
              }
              marquee = shopData[match].info;
              if (selectionType == "1") {
                output += "<center><table border=0>";
                for (let x = 0; x < outputArr.length; x++) {
                  let name = outputArr[x].display;
                  let button = match + "." + arr[x];
                  output +=
                    '<td style="padding: 8px;"><button style="border: 2px solid #000; border-radius: 15px 0px ; background: red; color: white;" name="send" value="/shop ' +
                    button +
                    '|1">' +
                    name +
                    "</button></td>";
                  if (
                    (x === 2 || (x === 5) | (x === 8)) &&
                    x != +outputArr.length - +1
                  )
                    output += "</table><br/><table border=0>";
                }
                output += "</table></center><br/></div>";
                assembleOutput(
                  output,
                  marquee,
                  shop,
                  selectionType,
                  "main",
                  update,
                  user,
                  room,
                  false
                );
              } else {
                //item selection
                output +=
                  '<div style="position: relative;"><div style="width: 60%; max-height: 300px; min-height: 250px; overflow-y: scroll;"><center><table border=0>';
                for (let x = 0; x < outputArr.length; x++) {
                  let name = outputArr[x].display;
                  let button = match + "." + arr[x];
                  output +=
                    '<td style="padding: 5px;"><button style="border: 2px solid #000; border-radius: 15px 0px ; background: red; color: white;" name="send" value="/shop ' +
                    button +
                    '|2">' +
                    name +
                    "</button></td><tr>";
                }
                output += "</table></center><br/></div>";
                //item info empty
                output +=
                  '<div style="position: absolute; top: 0px;right: 0px;bottom: 0px; width: 39%; max-height: 300px; min-height: 250px; background-color: rgba(128, 0, 255, 0.4); border: 2px solid; border-radius: 5px; color: #FFF;"><br/><br/><center><b>Select an Item for more info.</b></center></div></div>';
                assembleOutput(
                  output,
                  marquee,
                  shop,
                  selectionType,
                  "main",
                  update,
                  user,
                  room,
                  false
                );
              }
            } else {
              output = drawMain(output);
              selectionType = "main";
              assembleOutput(
                output,
                marquee,
                shop,
                selectionType,
                update,
                user,
                room,
                false
              );
            }
          }
        } else {
          let length = parts.length;
          let prog = 0;
          let arr = Object.getOwnPropertyNames(shopData);
          let path = [];
          let match = false;
          let container = false;
          let containerArr = false;
          for (let z = 0; z < length; z++) {
            for (let x in arr) {
              if (parts[z] == arr[x]) {
                match = arr[x];
                path.push(match);
                prog++;
              }
            }
            if (match) {
              if (z == 0) {
                selection = shopData[match].items;
              } else if (z > 0 && z != +length - +1) {
                selection = selection[match].items;
              } else if (z == +length - +1 && !selection[match].items) {
                container = selection;
                marquee = container.info;
                selection = selection[match];
              } else {
                marquee = selection[match].info;
                selection = selection[match].items;
              }
              arr = Object.getOwnPropertyNames(selection);
              if (container)
                containerArr = Object.getOwnPropertyNames(container);
              let test = arr[0];
              selectionType = selection[test].items ? "1" : "2";
              if (selectionType == "2" && prog !== length) {
                match = false;
              }
            }
          }
          if (match && prog == length && length == path.length) {
            if (isUpdate == "1") {
              if (selectionType == "1") {
                output += "<center><table border=0>";
                for (let x = 0; x < outputArr.length; x++) {
                  let last = "";
                  let back = "";
                  if (path.length >= 2) {
                    for (let q = 0; q < path.length; q++) {
                      last += path[q];
                      if (q !== +path.length - +1) {
                        last += ".";
                        back += path[q];
                        if (q !== +path.length - +2) back += ".";
                      }
                    }
                  } else {
                    last = +path.length - +1;
                    last = path[last];
                    back = "main";
                  }
                  let name = outputArr[x].display;
                  let button = last + "." + arr[x];
                  output +=
                    '<td style="padding: 8px;"><button style="border: 2px solid #000; border-radius: 15px 0px ; background: red; color: white;" name="send" value="/shop ' +
                    button +
                    '|1">' +
                    name +
                    "</button></td>";
                  if (
                    (x === 2 || (x === 5) | (x === 8)) &&
                    x != +outputArr.length - +1
                  )
                    output += "</table><br/><table border=0>";
                }
                output += "</table></center><br/></div>";
                assembleOutput(
                  output,
                  marquee,
                  shop,
                  selectionType,
                  back,
                  update,
                  user,
                  room,
                  false
                );
              } else {
                let outputArr = [];
                for (let y in arr) {
                  let item = arr[y];
                  outputArr.push(selection[item]);
                }
                output +=
                  '<div style="position: relative;"><div style="width: 60%; max-height: 300px; min-height: 250px; overflow-y: scroll;"><center><table border=0>';
                let back = "";
                for (let x = 0; x < outputArr.length; x++) {
                  let last = "";
                  if (path.length >= 2) {
                    for (let q = 0; q < path.length; q++) {
                      last += path[q];
                      if (q !== +path.length - +1) {
                        last += ".";
                        if (x == 0) back += path[q];
                        if (q !== +path.length - +2 && x == 0) back += ".";
                      }
                    }
                  } else {
                    last = +path.length - +1;
                    last = path[last];
                    back = "main";
                  }
                  let name = outputArr[x].display;
                  let button = last + "." + arr[x];
                  output +=
                    '<td style="padding: 5px;"><button style="border: 2px solid #0000; border-radius: 15px 0px ; background: red; color: white;" name="send" value="/shop ' +
                    button +
                    '|2">' +
                    name +
                    "</button></td><tr>";
                }
                output += "</table></center><br/></div>";
                //item info empty
                output +=
                  '<div style="position: absolute; top: 0px;right: 0px;bottom: 0px; width: 39%; max-height: 300px; min-height: 250px; background-color: rgba(108, 0, 255, 0.4);border: 2px solid; border-radius: 5px; color: white;"><br/><br/><center><b>Select an Item for more info.</b></center></div></div>';
                assembleOutput(
                  output,
                  marquee,
                  shop,
                  selectionType,
                  back,
                  update,
                  user,
                  room,
                  false
                );
              }
            } else {
              //item selection
              let outputArr = [];
              for (let y in containerArr) {
                let item = containerArr[y];
                outputArr.push(container[item]);
              }
              output +=
                '<div style="position: relative;"><div style="width: 60%; max-height: 300px; min-height: 250px; overflow-y: scroll;"><center><table border=0>';
              let back = "";
              for (let x = 0; x < outputArr.length; x++) {
                let last = "";
                if (path.length >= 3) {
                  for (let q = 0; q < +path.length - +1; q++) {
                    last += path[q];
                    if (q !== +path.length - +2) {
                      last += ".";
                      if (x == 0) back += path[q];
                      if (q !== +path.length - +3 && x == 0) back += ".";
                    }
                  }
                } else {
                  last = +path.length - +2;
                  last = path[last];
                  back = "main";
                }
                let name = outputArr[x].display;
                let button = last + "." + containerArr[x];
                output +=
                  '<td style="padding: 5px;"><button style="border: 2px solid ' +
                  (containerArr[x] == match ? "#ffffff" : "#000") +
                  ' ; border-radius: 15px 0px ; background: red; color: white;" name="send" value="/shop ' +
                  button +
                  '|2">' +
                  name +
                  "</button></td><tr>";
              }

              let itemId = +path.length - +1;
              itemId = path[itemId];
              output += "</table></center><br/></div>";
              scaleImage(selection.img, image => {
                output +=
                  '<div style="position: absolute; top: 0px;right: 0px;bottom: 0px;width: 39%; max-height: 300px; min-height: 250px; background-color: rgba(128, 0, 255, 0.4);border: 2px solid; border-radius: 5px;"><!-- split --><br/><center><b>' +
                  selection.display +
                  "</b><br/><br/>" +
                  (image
                    ? '<img src="' +
                      image[0] +
                      '" width=' +
                      image[1] +
                      " height=" +
                      image[2] +
                      "><br/>"
                    : "") +
                  "<br/><b>Price: </b>" +
                  selection.price +
                  " " +
                  selection.currency +
                  '<br/><br/><button style="border: 2px solid #000 ; border-radius: 15px 0px ; background: red ; color: white;" name="send" value="/redeem ' +
                  itemId +
                  '">Confirm Purchase</button></center><!-- split --></div></div>';
                marquee = selection.info;
                assembleOutput(
                  output,
                  marquee,
                  shop,
                  selectionType,
                  back,
                  update,
                  user,
                  room,
                  true
                );
              });
            }
          } else {
            selectionType = "main";
            assembleOutput(
              output,
              marquee,
              shop,
              selectionType,
              false,
              update,
              user,
              room,
              false
            );
          }
        }
      }
    } else {
      output = drawMain(output);
      selectionType = "main";
      assembleOutput(
        output,
        marquee,
        shop,
        selectionType,
        false,
        update,
        user,
        room,
        false
      );
    }
  },

  redeem: function(target, room, user) {
    let shopData = Server.shopData;
    let err = "Invalid target; this command is not meant to be used manually.";
    if (!target) return this.errorReply(err);
    target = toId(target).trim();
    let match = false;
    let money;
    let success = false;
    let sggame = Db.players.get(user.userid);
    let userPacks;
    for (let i in Server.itemList) {
      if (Server.itemList[i].name == target) match = Server.itemList[i];
    }
    if (!match) return this.errorReply(err);
    if (!user.tokens) user.tokens = {};
    let self = this;
    Economy.readMoney(user.userid, stardust => {
      switch (match.name) {
        case "customsymbol":
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            user.canCustomSymbol = true;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "globaldeclare":
          if (user.tokens.declare)
            return self.errorReply(
              "You already have this purchased! Use it first with /usetoken declare, [message]"
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            //Server.messageSeniorStaff(user.name + " has purchased a Global Declare. Please contact this user to run their Global Declare.");
            user.tokens.declare = true;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "customavatar":
          if (user.tokens.avatar)
            return self.errorReply(
              "You already have this purchased! Use it first with /usetoken avatar, [image]"
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            //Server.messageSeniorStaff(user.name + " has purchased a Custom Avatar. Please contact this user to setup their Custom Avatar.");
            //inventory.addItem('avatartoken', user);
            user.tokens.avatar = true;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "customcolor":
          if (user.tokens.color)
            return self.errorReply(
              "You already have this purchased! Use it first with /usetoken color, [hex code]"
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            //Server.messageSeniorStaff(user.name + " has purchased a Custom Color. Please contact this user to setup their Custom Color.");
            //inventory.addItem('colortoken', user);
            user.tokens.color = true;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "title":
          if (user.tokens.title)
            return self.errorReply(
              "You already have this purchased! Use it first with /usetoken title, [title], [hex color]"
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            //Server.messageSeniorStaff(user.name + " has purchased a Custom Title. Please contact this user to setup their Custom Color.");
            user.tokens.title = true;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          break;
        case "icon":
          if (user.tokens.icon)
            return self.errorReply(
              "You already have this purchased! Use it first with /usetoken icon, [image]"
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            //Server.messageSeniorStaff(user.name + " has purchased a Userlit Icon. Please contact this user to setup their Userlist Icon.");
            //inventory.addItem('icontoken', user);
            user.tokens.icon = true;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "emote":
          if (user.tokens.emote)
            return self.errorReply(
              "You already have this purchased! Use it first with /usetoken emote, [name], [image]"
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            //Server.messageSeniorStaff(user.name + " has purchased an Emote. Please contact this user to setup their Emote.");
            user.tokens.emote = true;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "profileteam":
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            //Server.messageSeniorStaff(user.name + " has purchased a room. Please contact this user to setup their room.");
            user.tokens.profileteam = true;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "profilemusic":
          if (user.tokens.profilemusic)
            return self.errorReply(
              "You already have this purchased! Use it first with /usetoken music, [link], [title of song]"
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            //Server.messageSeniorStaff(user.name + " has purchased an Emote. Please contact this user to setup their Emote.");
            user.tokens.profilemusic = true;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;

        case "profilebackground":
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            user.tokens.profilebackground = true;
            Db.hasbg.set(user, 1);
            Users(user).popup(
              "You have purchased profile background. use /pbg set [image] to set your profile bckground. Can be used only once."
            );
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "roomshop":
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            //Server.messageSeniorStaff(user.name + " has purchased a roomshop. Please contact this user to setup their roomshop.");
            user.tokens.roomshop = true;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;

        //SSBFFA
        case "shiny":
          if (!Server.ssb[user.userid])
            return this.sendReply(
              "You need to run /ssb edit at least once before you can buy this."
            );
          if (Server.ssb[user.userid].canShiny)
            return this.sendReply("You already own this.");
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            Server.ssb[user.userid].canShiny = true;
            writeSSB();
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "ffacustomsymbol":
          if (!Server.ssb[user.userid])
            return this.sendReply(
              "You need to run /ssb edit at least once before you can buy this."
            );
          if (Server.ssb[user.userid].cSymbol)
            return this.sendReply("You already own this.");
          if (user.isStaff || user.group === "+") {
            //give free
            Server.ssb[user.userid].cSymbol = true;
            writeSSB();
            return this.sendReply(
              "Because you have global auth you have been given this for free!"
            );
          }
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            Server.ssb[user.userid].cSymbol = true;
            writeSSB();
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "customitem":
          if (!Server.ssb[user.userid])
            return this.sendReply(
              "You need to run /ssb edit at least once before you can buy this."
            );
          if (Server.ssb[user.userid].bought.cItem)
            return this.sendReply("You already own this.");
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            Server.ssb[user.userid].bought.cItem = true;
            writeSSB();
            Server.messageSeniorStaff(
              user.name +
                " has purchased a Custom Item. Please contact this user to get details on what custom item they want."
            );
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "customability":
          if (!Server.ssb[user.userid])
            return this.sendReply(
              "You need to run /ssb edit at least once before you can buy this."
            );
          if (Server.ssb[user.userid].bought.cAbility)
            return this.sendReply("You already own this.");
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            Server.ssb[user.userid].bought.cAbility = true;
            writeSSB();
            Server.messageSeniorStaff(
              user.name +
                " has purchased a Custom Ability. Please contact this user to get details on what custom ability they want."
            );
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "custommove":
          if (!Server.ssb[user.userid])
            return this.sendReply(
              "You need to run /ssb edit at least once before you can buy this."
            );
          if (Server.ssb[user.userid].bought.cMove)
            return this.sendReply("You already own this.");
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            Server.ssb[user.userid].bought.cMove = true;
            writeSSB();
            Server.messageSeniorStaff(
              user.name +
                " has purchased a Custom Move. Please contact this user to get details on what custom move they want."
            );
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "berry1":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let berries1 = [
              "cheriberry",
              "pechaberry",
              "rawstberry",
              "chestoberry",
              "aspearberry",
              "persimberry",
              "oranberry",
              "sitrusberry",
              "lumberry",
              "leppaberry"
            ];
            for (let c = 0; c < 30; c++) {
              let b = Server.getItem(
                berries1[Math.floor(Math.random() * berries1.length)]
              );
              if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
              sggame.bag[b.slot][b.id]++;
            }
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "berry2":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let berries2 = [
              "aguavberry",
              "apicotberry",
              "babiriberry",
              "chartiberry",
              "chilanberry",
              "chopleberry",
              "cobaberry",
              "colburberry",
              "custapberry",
              "enigmaberry",
              "figyberry",
              "ganlonberry",
              "habanberry",
              "iapapaberry",
              "jabocaberry",
              "kasibberry",
              "kebiaberry",
              "keeberry",
              "lansatberry",
              "liechiberry",
              "magoberry",
              "marangaberry",
              "micleberry",
              "occaberry",
              "passhoberry",
              "payapaberry",
              "petayaberry",
              "rindoberry",
              "roseliberry",
              "rowapberry",
              "salacberry",
              "shucaberry",
              "starfberry",
              "tangaberry",
              "wacanberry",
              "wikiberry",
              "yacheberry"
            ];
            for (let c = 0; c < 30; c++) {
              let b = Server.getItem(
                berries2[Math.floor(Math.random() * berries2.length)]
              );
              if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
              sggame.bag[b.slot][b.id]++;
            }
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "pokeball":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let b = Server.getItem(match.name);
            if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
            sggame.bag[b.slot][b.id] += 5;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "potion":
        case "greatball":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let b = Server.getItem(match.name);
            if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
            sggame.bag[b.slot][b.id] += 5;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "parlyzheal":
        case "antidote":
        case "burnheal":
        case "iceheal":
        case "awakening":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let b = Server.getItem(match.name);
            if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
            sggame.bag[b.slot][b.id] += 10;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "ultraball":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let b = Server.getItem(match.name);
            if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
            sggame.bag[b.slot][b.id] += 5;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "masterball":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let b = Server.getItem(match.name);
            if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
            sggame.bag[b.slot][b.id] += 1;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "superpotion":
        case "fullheal":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let b = Server.getItem(match.name);
            if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
            sggame.bag[b.slot][b.id] += 6;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "hyperpotion":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let b = Server.getItem(match.name);
            if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
            sggame.bag[b.slot][b.id] += 4;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "maxpotion":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let b = Server.getItem(match.name);
            if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
            sggame.bag[b.slot][b.id] += 3;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "fullrestore":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let b = Server.getItem(match.name);
            if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
            sggame.bag[b.slot][b.id] += 2;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;
        case "hpup":
        case "protein":
        case "iron":
        case "calcium":
        case "zinc":
        case "carbos":
          if (!sggame)
            return this.sendReply(
              "You need to start SGgame before buying this."
            );
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            let b = Server.getItem(match.name);
            if (!sggame.bag[b.slot][b.id]) sggame.bag[b.slot][b.id] = 0;
            sggame.bag[b.slot][b.id]++;
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;

        case "ancientorigins":
        case "aquapolis":
        case "arceus":
        case "breakpoint":
        case "breakthrough":
        case "bwblackstarpromos":
        case "base":
        case "baseset2":
        case "blackwhite":
        case "boundariescrossed":
        case "burningshadows":
        case "calloflegends":
        case "crystalguardians":
        case "darkexplorers":
        case "deltaspecies":
        case "deoxys":
        case "diamondpearl":
        case "doublecrisis":
        case "dragon":
        case "dragonfrontiers":
        case "dragonvault":
        case "dragonsexalted":
        case "emerald":
        case "emergingpowers":
        case "evolutions":
        case "expeditionbaseset":
        case "fatescollide":
        case "fireredleafgreen":
        case "flashfire":
        case "fossil":
        case "furiousfists":
        case "generations":
        case "greatencounters":
        case "guardiansrising":
        case "gymchallenge":
        case "gymheroes":
        case "hstriumphant":
        case "hsundaunted":
        case "hsunleashed":
        case "heartgoldsoulsilver":
        case "hiddenlegends":
        case "holonphantoms":
        case "jungle":
        case "kalosstarterset":
        case "legendmaker":
        case "legendarycollection":
        case "legendarytreasures":
        case "legendsawakened":
        case "majesticdawn":
        case "mysterioustreasures":
        case "neodestiny":
        case "neodiscovery":
        case "neogenesis":
        case "neorevelation":
        case "nextdestinies":
        case "noblevictories":
        case "popseries1":
        case "popseries2":
        case "popseries3":
        case "popseries4":
        case "popseries5":
        case "popseries6":
        case "popseries7":
        case "popseries8":
        case "popseries9":
        case "phantomforces":
        case "plasmablast":
        case "plasmafreeze":
        case "plasmastorm":
        case "platinum":
        case "powerkeepers":
        case "primalclash":
        case "risingrivals":
        case "roaringskies":
        case "rubysapphire":
        case "smblackstarpromos":
        case "sandstorm":
        case "secretwonders":
        case "shininglegends":
        case "skyridge":
        case "steamsiege":
        case "stormfront":
        case "sunmoon":
        case "supremevictors":
        case "teammagmavsteamaqua":
        case "teamrocket":
        case "teamrocketreturns":
        case "unseenforces":
        case "wizardsblackstarpromos":
        case "xy":
        case "xyblackstarpromos":
          money = setupPrice(match, stardust);
          success = runTransaction(money, match, user);
          if (success) {
            Db.userpacks.set(
              user.userid,
              Db.userpacks.get(user.userid, []).concat([match.display])
            );
            successfulTransaction(match, success, user, room);
          } else {
            failedTransaction(user, match, money, room);
          }
          user.shopCache = false;
          break;

        /* Keep this for later
			    	targetRoom.update();
		    		targetRoom.shop = {};
		    		targetRoom.shopList = [];
		    		targetRoom.chatRoomData.shop = targetRoom.shop;
		    		targetRoom.chatRoomData.shopList = targetRoom.shopList;
		    		Rooms.global.writeChatRoomData();
					*/
      }
    });
  },
  rebuy: function(target, room, user) {
    if (!target) return false;
    target = target.trim();
    user.shopCache = "";
    return this.parse("/redeem " + target);
  },
  loadshop: function(target, room, user, connection) {
    if (!user.hasConsoleAccess(connection))
      return this.errorReply("/dev - Access Denied.");
    loadShops();
  },

  receipt: "receipts",
  receipts: function(target, room, user) {
    let options;
    let receipts = fs
      .readFileSync("logs/transactions.log", "utf8")
      .split("\n")
      .reverse();
    if (!target) {
      options = 1;
    } else {
      target = target.split(",");
      if (target.length > 1) {
        options = 2;
        for (let t in target) target[t] = toId(target[t]).trim();
      } else {
        target = target[0].trim();
        if (target === "help") return this.parse("/shop help");
        options = 3;
      }
    }
    if (options === 1) {
      let ownedReceipts = [];
      for (let i in receipts) {
        let parts = receipts[i].split("|");
        if (toId(parts[0]) === user.userid) ownedReceipts.push(parts[5]);
      }
      if (ownedReceipts.length > 0) {
        return this.sendReply(
          "Your receipts: " +
            ownedReceipts.join(", ") +
            ". Use /receipt [receiptID] to view details."
        );
      } else {
        return this.sendReply(
          "You do not have any recent receipts (receipts are deleted after one month)."
        );
      }
    } else if (options === 2) {
      if (target[0] !== "view" || target.length !== 2)
        this.sendReply("/receipts view, [user]");
      if (!this.can("ban")) this.errorReply("Access Denied.");
      let name = Users.get(target[1]);
      if (!name) {
        name = target[1];
      } else {
        name = name.name;
      }
      let ownedReceipts = [];
      for (let i in receipts) {
        let parts = receipts[i].split("|");
        if (toId(parts[0]) === target[1]) ownedReceipts.push(parts[5]);
      }
      if (ownedReceipts.length > 0) {
        return this.sendReply(
          "Receipts of " +
            name +
            ": " +
            ownedReceipts.join(", ") +
            ". Use /receipt [receiptID] to view details."
        );
      } else {
        return this.sendReply(
          name +
            " does not have any recent receipts (receipts are deleted after one month)."
        );
      }
    } else if (options === 3) {
      let receipt = false;
      for (let i in receipts) {
        let parts = receipts[i].split("|");
        if (parts[5] == target) receipt = parts;
      }
      if (!receipt) {
        return this.errorReply("Invalid receipt ID");
      } else {
        if (receipt[0] !== user.userid && !this.can("ban"))
          return this.sendReply("You can only view your own receipts.");
        let expire = parseInt(receipt[7]);
        expire = +30 - +expire;
        expire = expire.toString();
        return this.sendReplyBox(
          "<center><b>Receipt " +
            receipt[5] +
            "</b></center><br/><b>Name: </b>" +
            receipt[0] +
            "<br/><b>Date: </b>" +
            receipt[1] +
            "<br/><b>Item: </b>" +
            receipt[2] +
            "<br/><b>Price: </b>" +
            receipt[3] +
            "<br/><b>Currency: </b>" +
            receipt[4] +
            "<br/><b>Remaining " +
            receipt[4] +
            ": </b>" +
            receipt[6] +
            "<br/><b>Days until expiry: </b>" +
            expire
        );
      }
    } else {
      return this.parse("/shop help");
    }
  }
};
