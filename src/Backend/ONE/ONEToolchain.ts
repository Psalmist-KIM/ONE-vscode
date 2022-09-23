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

import { execSync } from 'child_process';
import {Backend} from '../Backend';
import {Command} from '../Command';
import {Compiler} from '../Compiler';
import {Executor} from '../Executor';
import {ToolchainInfo, Toolchains} from '../Toolchain';
import { DebianToolchain } from '../ToolchainImpl/DebianToolchain';
import { Version } from '../Version';

class ToolchainCompiler implements Compiler {
  private readonly toolchainTypes: string[];
  private readonly toolchainName: string;

  constructor() {
    this.toolchainName = 'onecc-docker-test'
    this.toolchainTypes = ['latest'];
  }

  getToolchainTypes(): string[] {
    return this.toolchainTypes;
  }

  getToolchains(_toolchainType: string, _start: number, _count: number): Toolchains {
    // throw Error('Invalid getToolchains call');
    if(parseInt(execSync(`apt-cache show ${this.toolchainName} > /dev/null 2>&1; echo $?`)
    .toString().trim()) !== 0) {
      throw Error("prerequites");
    }

    let availableToolchains = new Toolchains();

    execSync(`apt-cache show ${this.toolchainName} | grep Version | awk '{print $2}'`)
    .toString()
    .trim()
    .split('\n')
    .map((str) => str)
    .forEach((version) => {
      version = version+'~test';
      version.split('/[.\\~]+/').forEach((e) => console.log(e));
      availableToolchains.push(new DebianToolchain(new ToolchainInfo(this.toolchainName, 'test', new Version(1,0,0))));
    })
    return availableToolchains;
  }

  getInstalledToolchains(_toolchainType: string): Toolchains {
    // throw Error('Invalid getInstalledToolchains call');
    // 설치하면 오케이..!
    console.log(this.getToolchains(this.toolchainTypes[0],0,0)[0].installed().str());
    return [];
  }

  prerequisitesForGetToolchains(): Command {
    // throw Error('Invalid prerequisitesForGetToolchains call');
    const cmd = new Command('add-apt-repository');
    cmd.push('ppa:psalmist-kim/ppa');
    cmd.push('-y');
    cmd.push('&&');
    cmd.push('apt-get');
    cmd.push('update');
    cmd.setRoot();
    return cmd;
  }
}

class ONEToolchain implements Backend {
  private readonly backendName: string;
  private readonly toolchainCompiler: Compiler|undefined;

  constructor() {
    this.backendName = 'ONE';
    this.toolchainCompiler = new ToolchainCompiler();
  }

  name(): string {
    return this.backendName;
  }

  compiler(): Compiler|undefined {
    return this.toolchainCompiler;
  }

  executor(): Executor|undefined {
    return undefined;
  }

  executors(): Executor[] {
    return [];
  }
}

export {ONEToolchain};
