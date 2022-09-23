"use strict";
/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
exports.__esModule = true;
exports.ONEToolchain = void 0;
var child_process_1 = require("child_process");
var Command_1 = require("../Command");
var Toolchain_1 = require("../Toolchain");
var DebianToolchain_1 = require("../ToolchainImpl/DebianToolchain");
var Version_1 = require("../Version");
// nodejs will be changed to onecc-docker-compiler
var latestVersion = new DebianToolchain_1.DebianToolchain(new Toolchain_1.ToolchainInfo('nodejs', 'Test package', new Version_1.Version(8, 10, 0, '~dfsg-2ubuntu0.4')));
var ToolchainCompiler = /** @class */ (function () {
    function ToolchainCompiler() {
        // For now, we support only latest version.
        this.toolchainTypes = ['latest'];
        this.availableToolchains = new Toolchain_1.Toolchains();
        this.installedToolchains = new Toolchain_1.Toolchains();
    }
    ToolchainCompiler.prototype.getToolchainTypes = function () {
        return this.toolchainTypes;
    };
    ToolchainCompiler.prototype.getToolchains = function (toolchainType, start, count) {
        if (!this.toolchainTypes.includes(toolchainType)) {
            throw Error("Unknown toolchain type: ".concat(toolchainType));
        }
        // prerequisites must be installed before getting available toolchains.
        // if('prerequisites are not met') {
        //   throw Error(`the prerequisites are not met`);
        // }
        if (toolchainType === 'latest') {
            this.availableToolchains = [latestVersion];
        }
        return this.availableToolchains;
    };
    ToolchainCompiler.prototype.getInstalledToolchains = function (toolchainType) {
        if (!this.toolchainTypes.includes(toolchainType)) {
            throw Error("Unknown toolchain type: ".concat(toolchainType));
        }
        // Check if the toolchain is installed in the available toolchains, and returns installed
        // toolchain.
        this.installedToolchains = this.getToolchains(toolchainType).filter(function (toolchain) {
            return parseInt((0, child_process_1.execSync)("dpkg-query --show ".concat(toolchain.info.name, " > /dev/null 2>&1; echo $?"))
                .toString()
                .trim()) === 0;
        });
        return this.installedToolchains;
    };
    ToolchainCompiler.prototype.prerequisitesForGetToolchains = function () {
        return new Command_1.Command('/bin/echo', ['prerequisites']);
    };
    return ToolchainCompiler;
}());
var ONEToolchain = /** @class */ (function () {
    function ONEToolchain() {
        this.backendName = 'ONE';
        this.toolchainCompiler = new ToolchainCompiler();
    }
    ONEToolchain.prototype.name = function () {
        return this.backendName;
    };
    ONEToolchain.prototype.compiler = function () {
        return this.toolchainCompiler;
    };
    ONEToolchain.prototype.executor = function () {
        return undefined;
    };
    ONEToolchain.prototype.executors = function () {
        return [];
    };
    return ONEToolchain;
}());
exports.ONEToolchain = ONEToolchain;
