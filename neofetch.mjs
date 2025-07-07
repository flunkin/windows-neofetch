import si from 'systeminformation';
import os from 'os';

const asciiArt = `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢤⣶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⡾⠿⢿⡀⠀⠀⠀⠀⣠⣶⣿⣷⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣦⣴⣿⡋⠀⠀⠈⢳⡄⠀⢠⣾⣿⠁⠈⣿⡆⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⠿⠛⠉⠉⠁⠀⠀⠀⠹⡄⣿⣿⣿⠀⠀⢹⡇⠀⠀⠀
⠀⠀⠀⠀⠀⣠⣾⡿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⣰⣏⢻⣿⣿⡆⠀⠸⣿⠀⠀⠀
⠀⠀⠀⢀⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⣿⣿⣆⠹⣿⣷⠀⢘⣿⠀⠀⠀
⠀⠀⢀⡾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣿⠋⠉⠛⠂⠹⠿⣲⣿⣿⣧⠀⠀
⠀⢠⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣿⣿⣿⣷⣾⣿⡇⢀⠀⣼⣿⣿⣿⣧⠀
⠰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⡘⢿⣿⣿⣿⠀
⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⣷⡈⠿⢿⣿⡆
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠛⠁⢙⠛⣿⣿⣿⣿⡟⠀⡿⠀⠀⢀⣿⡇
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣶⣤⣉⣛⠻⠇⢠⣿⣾⣿⡄⢻⡇
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣦⣤⣾⣿⣿⣿⣿⣆⠁
`;

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400); // 60*60*24
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  return `${days}d ${hrs}h ${mins}m`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);

  const rounded = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);

  return `${rounded} ${sizes[i]}`;
}

async function getSystemInfo() {
  // format system info
  const [osData, cpuData, memData, diskData, gpuData, netData] = await Promise.all([
    si.osInfo(),
    si.cpu(),
    si.mem(),
    si.fsSize(),
    si.graphics(),
    si.networkInterfaces(),
  ]);

  const uptimeSeconds = si.time().uptime;

  const hostname = os.hostname();
  const kernelVersion = os.version();

  let ip = 'N/A';
  let netIface = 'No networks (big sad)';

  for (const iface of netData) {
    if (iface.operstate === 'up' && iface.ip4 && iface.ip4 !== '127.0.0.1') {
      ip = iface.ip4;
      netIface = iface.iface;
      break;
    }
  }

  // sumarise disk size
  const totalDisk = diskData.reduce((acc, disk) => acc + disk.size, 0);

  return {
    host: hostname,
    os: `${osData.distro} ${osData.release}`,
    kernel: kernelVersion,
    uptime: formatUptime(uptimeSeconds),
    cpu: cpuData.brand,
    cores: cpuData.cores,
    gpu: gpuData.controllers.length ? gpuData.controllers[0].model : 'N/A',
    ram: formatBytes(memData.total),
    disk: formatBytes(totalDisk),
    arch: `${process.arch} / OS: ${os.arch()}`,
    network: netIface,
    ip,
    node: process.version,
  };
}

async function main() {
  const info = await getSystemInfo();

  const leftLines = asciiArt.trim().split('\n');
  const rightLines = [
    `Host >        ${info.host}`,
    `OS >          ${info.os}`,
    `Kernel >      ${info.kernel}`,
    `Uptime >      ${info.uptime}`,
    `CPU >         ${info.cpu}`,
    `Cores >       ${info.cores}`,
    `GPU >         ${info.gpu}`,
    `RAM Total >   ${info.ram}`,
    `Disk Total >  ${info.disk}`,
    `Network >     ${info.network}`,
    `IP >          ${info.ip}`,
    `Node.js >     ${info.node}`,
    `Arch >        ${info.arch}`,
  ];

  const maxLines = Math.max(leftLines.length, rightLines.length);

  for (let i = 0; i < maxLines; i++) {
    const leftLine = leftLines[i] || '';
    const rightLine = rightLines[i] || '';
    console.log(leftLine.padEnd(42) + rightLine);
  }
}

main().catch(err => {
  console.error('Error fetching system info:', err);
});
