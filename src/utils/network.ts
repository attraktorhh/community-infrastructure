import { networkInterfaces } from "os";

export async function getIpOfCurrentMachine() {
  let ip = "0.0.0.0";
  const ips = networkInterfaces();

  Object.keys(ips).forEach(function (_interface) {
    ips[_interface].forEach(function (_dev) {
      if (_dev.family === "IPv4" && !_dev.internal) ip = _dev.address;
    });
  });

  return ip;
}
