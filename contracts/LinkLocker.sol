// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LinkLocker {
    uint256 public nextLinkId = 1;

    struct LinkCard {
        address maker;
        string title;
        string url;
        string source;
        string purpose;
        string note;
        uint256 createdAt;
    }

    mapping(uint256 => LinkCard) private links;

    event LinkSaved(
        uint256 indexed linkId,
        address indexed maker,
        string title,
        string url,
        string source
    );

    function saveLink(
        string calldata title,
        string calldata url,
        string calldata source,
        string calldata purpose,
        string calldata note
    ) external returns (uint256 linkId) {
        require(bytes(title).length > 0 && bytes(title).length <= 56, "Invalid title");
        require(bytes(url).length > 0 && bytes(url).length <= 160, "Invalid url");
        require(bytes(source).length > 0 && bytes(source).length <= 36, "Invalid source");
        require(bytes(purpose).length > 0 && bytes(purpose).length <= 36, "Invalid purpose");
        require(bytes(note).length > 0 && bytes(note).length <= 180, "Invalid note");

        linkId = nextLinkId++;
        links[linkId] = LinkCard({
            maker: msg.sender,
            title: title,
            url: url,
            source: source,
            purpose: purpose,
            note: note,
            createdAt: block.timestamp
        });

        emit LinkSaved(linkId, msg.sender, title, url, source);
    }

    function getLink(
        uint256 linkId
    )
        external
        view
        returns (
            address maker,
            string memory title,
            string memory url,
            string memory source,
            string memory purpose,
            string memory note,
            uint256 createdAt
        )
    {
        LinkCard storage entry = links[linkId];
        return (
            entry.maker,
            entry.title,
            entry.url,
            entry.source,
            entry.purpose,
            entry.note,
            entry.createdAt
        );
    }
}
