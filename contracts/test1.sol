// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract SimpleStorage {
    string  storedData = 
      '    * * *   * * *\n' 
      '  * *   * * *   * *\n' 
      '  *       *       *\n' 
      '  * *           * *\n' 
      '    * *       * *\n' 
      '      * *   * *\n' 
      '        * * *\n' 
      '          *';

    function set(string memory x) public {
        storedData = x;
    }

    function get() public view returns (string memory) {
        return storedData;
    }
}